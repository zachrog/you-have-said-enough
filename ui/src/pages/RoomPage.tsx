import { useEffect, useState } from "react";
import { VideoComponent } from "../components/VideoComponent";
import {
  VideoPeerConnection,
  rtcPeerConnectionManager,
} from "../rtcPeerConnectionManager";
import {
  SocketClient,
  createSocketClient,
  someoneNewJoined,
  clientNewIceCandidate,
  clientNewAnswer,
  clientNewOffer,
} from "@/socketClient";
import { MediaBar } from "@/components/MediaBar";
import { useParams } from "react-router-dom";
import clsx from "clsx";
import { Room } from "server/src/entities/Room";
import { DEFAULT_AUDIO_WINDOW } from "@/lib/audioStatistics";

export function RoomPage() {
  const { roomId } = useParams();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<VideoPeerConnection[]>(
    []
  );
  const [socketClient, setSocketClient] = useState<SocketClient | undefined>(
    undefined
  );
  const [mediaAccessAvailability, setMediaAccessAvailability] = useState<
    "deciding" | "blocked" | "available"
  >("deciding");
  const [roomInfo, setRoomInfo] = useState<Room>({
    roomId: roomId!,
    audioWindow: DEFAULT_AUDIO_WINDOW,
  });
  // const totalVideos = 9; // WHEN TESTING
  const totalVideos = peerConnections.length + 1; // WHEN DEPLOYED

  useEffect(() => {
    // need to set remote streams
    // We do not want to add multiple listeners every time the component re-renders
    rtcPeerConnectionManager.listeners.push(() => {
      setPeerConnections(rtcPeerConnectionManager.getPeerConnections());
    });

    return () => {
      rtcPeerConnectionManager
        .getPeerConnections()
        .forEach((peerConnection) => {
          // Close the senders' tracks
          peerConnection.rtcPeerConnection.getSenders().forEach((sender) => {
            const track = sender.track;
            if (track) {
              track.stop();
            }
          });

          // Close the receivers' tracks (for remote tracks)
          peerConnection.rtcPeerConnection
            .getReceivers()
            .forEach((receiver) => {
              const track = receiver.track;
              if (track) {
                track.stop();
              }
            });

          // Close the peer connection
          peerConnection.rtcPeerConnection.close();
        });
    };
  }, []);

  useEffect(() => {
    let localMediaStream: MediaStream;
    const getUserMedia = async () => {
      try {
        localMediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: 16 / 9,
          },
          audio: true,
        });
        setMediaAccessAvailability("available");
        setLocalStream(localMediaStream);
        rtcPeerConnectionManager.setLocalMediaStream({ localMediaStream });
      } catch (e) {
        if (e instanceof DOMException && e.name === "NotAllowedError") {
          setMediaAccessAvailability("blocked");
        }
      }
    };

    getUserMedia();

    return () => {
      localMediaStream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!localStream) return;
    async function initSocketClient() {
      const newSocketClient = await createSocketClient();
      newSocketClient.addMessageListener(clientNewIceCandidate);
      newSocketClient.addMessageListener(async (message) => {
        await someoneNewJoined(message, newSocketClient);
      });
      newSocketClient.addMessageListener(clientNewAnswer);
      newSocketClient.addMessageListener(async (message) => {
        await clientNewOffer(message, newSocketClient);
      });
      newSocketClient.addMessageListener((message) => {
        if (message.action === "roomInfo") {
          setRoomInfo(message.data);
        }
      });
      newSocketClient.sendMessage({
        roomId: roomId!,
        action: "enterRoom",
        data: "",
        from: "",
        to: "",
      });
      setSocketClient(newSocketClient);
    }
    if (!socketClient) {
      initSocketClient().catch(console.error);
    }

    return () => {
      if (socketClient) {
        socketClient.close();
      }
    };
  }, [localStream, socketClient]);

  function handleMicMuteChange(isMuted: boolean) {
    const localAudioTrack = localStream?.getAudioTracks()?.[0];
    if (localAudioTrack) {
      localAudioTrack.enabled = !isMuted;
    }
  }

  function handleCameraDisableChange(isDisabled: boolean) {
    const localVideoTrack = localStream?.getVideoTracks()?.[0];
    if (localVideoTrack) {
      localVideoTrack.enabled = !isDisabled;
    }
  }

  async function handleMicChange(micId: string) {
    if (localStream) {
      // Get a new media stream from the selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: micId } },
      });

      // Replace the audio track in the RTCPeerConnection
      const newAudioTrack = newStream.getAudioTracks()[0];
      const oldAudioTrack = localStream.getAudioTracks()[0];
      localStream.removeTrack(oldAudioTrack);
      localStream.addTrack(newAudioTrack);
      await Promise.all(
        rtcPeerConnectionManager
          .getPeerConnections()
          .map(async (peerConnection) => {
            const sender = peerConnection.rtcPeerConnection
              .getSenders()
              .find((s) => s.track?.kind === "audio");
            if (sender) {
              await sender.replaceTrack(newAudioTrack);
            }
          })
      );
      oldAudioTrack.stop();
      localStream.dispatchEvent(new Event("audioTrackAdded"));
    }
  }

  async function handleCameraChange(cameraId: string) {
    if (localStream) {
      // Get a new media stream from the selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: cameraId } },
      });

      // Replace the video track in the RTCPeerConnection
      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = localStream.getVideoTracks()[0];
      localStream.removeTrack(oldVideoTrack);
      localStream.addTrack(newVideoTrack);
      await Promise.all(
        rtcPeerConnectionManager
          .getPeerConnections()
          .map(async (peerConnection) => {
            const sender = peerConnection.rtcPeerConnection
              .getSenders()
              .find((s) => s.track?.kind === "video");
            if (sender) {
              await sender.replaceTrack(newVideoTrack);
            }
          })
      );
      oldVideoTrack.stop();
      localStream.dispatchEvent(new Event("videoTrackAdded"));
    }
  }

  async function handleOnRoomChange(newRoomInfo: Room) {
    if (!socketClient) return;
    socketClient.sendMessage({
      action: "updateRoom",
      data: newRoomInfo,
      roomId: newRoomInfo.roomId,
      from: socketClient.myConnectionId,
      to: "",
    });
    setRoomInfo(newRoomInfo);
  }

  if (mediaAccessAvailability === "deciding") {
    return;
  }

  if (mediaAccessAvailability === "blocked") {
    return (
      <>
        <div className="flex items-center justify-center min-h-[100dvh]">
          <div className="w-1/2">
            <h1 className="text-5xl text-center font-bold mb-10">
              Camera Error
            </h1>
            <p className="text-3xl font-light">
              Look... We are really going to need access to your camera for this
              whole thing to work. Please enable it in your browser settings and
              refresh, or stare at a black screen. Your call.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-screen w-full flex flex-col justify-between">
        <div
          className={clsx([
            "w-full h-full grid overflow-hidden",
            totalVideos === 1 && "grid-cols-1",
            totalVideos > 1 && totalVideos < 5 && "grid-cols-2",
            totalVideos >= 5 && "grid-cols-3",
          ])}
        >
          {/* {localStream && // Used for testing when you have no friends :(
            new Array(totalVideos)
              .fill(undefined)
              .map((_, i) => (
                <VideoComponent
                  key={i}
                  stream={localStream}
                  local
                  audioWindow={roomInfo.audioWindow}
                />
              ))} */}
          {localStream && (
            <VideoComponent
              key={"local"}
              stream={localStream}
              audioWindow={roomInfo.audioWindow}
              local
            />
          )}
          {peerConnections.map((remoteConnection) => {
            return (
              <>
                <VideoComponent
                  stream={remoteConnection.remoteMediaStream}
                  key={remoteConnection.peerId}
                  audioWindow={roomInfo.audioWindow}
                />
              </>
            );
          })}
        </div>
        <MediaBar
          roomInfo={roomInfo}
          onRoomChange={handleOnRoomChange}
          onCameraDisable={handleCameraDisableChange}
          onMicChange={handleMicChange}
          onCameraChange={handleCameraChange}
          onMicMuteChange={handleMicMuteChange}
        />
      </div>
    </>
  );
}
