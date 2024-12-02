import { useEffect, useState } from "react";
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
import { VideoComponent } from "@/components/VideoComponentDumb";
import { speechCurrency, SpeechUser } from "@/speechCurrency";

export function RoomPage() {
  const { roomId } = useParams();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [socketClient, setSocketClient] = useState<SocketClient | undefined>(
    undefined
  );
  const [mediaAccessAvailability, setMediaAccessAvailability] = useState<
    "deciding" | "blocked" | "available"
  >("deciding");

  useEffect(() => {
    let localMediaStream: MediaStream;
    const getUserMedia = async () => {
      try {
        localMediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 360, ideal: 720, max: 1080 },
            aspectRatio: 16 / 9,
            frameRate: { ideal: 30, max: 60 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
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

    getUserMedia().catch(console.error);

    return () => {
      localMediaStream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    let newSocketClient: SocketClient;
    async function initSocketClient() {
      newSocketClient = await createSocketClient();
      setSocketClient(newSocketClient);
    }

    initSocketClient().catch(console.error);
    return () => {
      if (newSocketClient) {
        newSocketClient.close();
      }
    };
  }, []);

  if (
    mediaAccessAvailability === "deciding" ||
    !localStream ||
    !roomId ||
    !socketClient
  ) {
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
      <LoadedRoom
        localStream={localStream}
        roomId={roomId}
        socketClient={socketClient}
      />
    </>
  );
}

export function LoadedRoom({
  roomId,
  localStream,
  socketClient,
}: {
  roomId: string;
  localStream: MediaStream;
  socketClient: SocketClient;
}) {
  const [peerConnections, setPeerConnections] = useState<VideoPeerConnection[]>(
    []
  );
  const [roomInfo, setRoomInfo] = useState<Room>({
    roomId: roomId,
    audioWindow: DEFAULT_AUDIO_WINDOW,
  });
  const [roomScale, setRoomScale] = useState<Map<string, SpeechUser>>(
    new Map()
  );
  // const totalVideos = 8; // WHEN TESTING
  const totalVideos = peerConnections.length + 1; // WHEN DEPLOYED

  useEffect(() => {
    // need to set remote streams
    // We do not want to add multiple listeners every time the component re-renders
    rtcPeerConnectionManager.onChange.push(() => {
      setPeerConnections(rtcPeerConnectionManager.getPeerConnections());
    });

    return () => {
      rtcPeerConnectionManager.clear();
    };
  }, []);

  useEffect(() => {
    socketClient.addMessageListener(clientNewIceCandidate);
    socketClient.addMessageListener(async (message) => {
      await someoneNewJoined(message, socketClient);
    });
    socketClient.addMessageListener(clientNewAnswer);
    socketClient.addMessageListener(async (message) => {
      await clientNewOffer(message, socketClient);
    });
    socketClient.addMessageListener((message) => {
      if (message.action === "roomInfo") {
        setRoomInfo(message.data);
      }
    });
    socketClient.addMessageListener((message) => {
      if (message.action === "userDisconnected") {
        rtcPeerConnectionManager.closePeerConnection(message.from);
      }
    });
    socketClient.sendMessage({
      roomId: roomId,
      action: "enterRoom",
      data: "",
      from: "",
      to: "",
    });

    return () => {};
  }, [roomId, socketClient]);

  useEffect(() => {
    let animationFrameId: number;
    void speechCurrency.addUser({
      peerId: socketClient.myConnectionId,
      stream: localStream,
    });
    rtcPeerConnectionManager.onChange.push((event) => {
      if (event.action === "join") {
        void speechCurrency.addUser({
          peerId: event.peerConnection.peerId,
          stream: event.peerConnection.remoteMediaStream,
        });
      }
      if (event.action === "leave") {
        speechCurrency.removeUser(event.peerConnection.peerId);
      }
      speechCurrency.reset();
    });

    function infinitelyUpdateRoomScale() {
      const roomScale2 = speechCurrency.getRoomScale();
      setRoomScale(new Map(roomScale2));
      animationFrameId = requestAnimationFrame(infinitelyUpdateRoomScale);
    }
    infinitelyUpdateRoomScale();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      speechCurrency.clear();
    };
  }, []);

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
      speechCurrency.changeMic({ peerId: socketClient.myConnectionId });
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
    speechCurrency.setAudioWindow(newRoomInfo.audioWindow);
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
                  isTalking={
                    roomScale.get(socketClient.myConnectionId)?.isTalking ||
                    false
                  }
                  scalar={
                    roomScale.get(socketClient.myConnectionId)?.scalar || 1
                  }
                />
              ))} */}
          {localStream && (
            <>
              <VideoComponent
                key={"local"}
                stream={localStream}
                local
                isTalking={
                  roomScale.get(socketClient.myConnectionId)?.isTalking || false
                }
                scalar={roomScale.get(socketClient.myConnectionId)?.scalar || 1}
              />
              <p>
                timeLeft: {roomScale.get(socketClient.myConnectionId)?.timeLeft}
              </p>
            </>
          )}
          {peerConnections.map((remoteConnection) => {
            return (
              <>
                <VideoComponent
                  stream={remoteConnection.remoteMediaStream}
                  key={remoteConnection.peerId}
                  isTalking={
                    roomScale.get(remoteConnection.peerId)?.isTalking || false
                  }
                  scalar={roomScale.get(remoteConnection.peerId)?.scalar || 1}
                />
                <p>
                  timeLeft: {roomScale.get(remoteConnection.peerId)?.timeLeft}
                </p>
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
