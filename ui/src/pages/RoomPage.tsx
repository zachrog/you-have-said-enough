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

export function RoomPage() {
  const { roomId } = useParams();
  const [_, setMyConnectionId] = useState<string>("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<VideoPeerConnection[]>(
    []
  );
  const [speakerId, setSpeakerId] = useState("default");
  const [cameraId, setCameraId] = useState("");
  const [socketClient, setSocketClient] = useState<SocketClient | undefined>(
    undefined
  );
  const [mediaAccessAvailability, setMediaAccessAvailability] = useState<
    "deciding" | "blocked" | "available"
  >("deciding");
  // const totalVideos = peerConnections.length + 1;
  const totalVideos = 6;

  useEffect(() => {
    // need to set remote streams
    // We do not want to add multiple listeners every time the component re-renders
    rtcPeerConnectionManager.listeners.push(() => {
      setPeerConnections(rtcPeerConnectionManager.getPeerConnections());
    });
  }, []);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const localMediaStream = await navigator.mediaDevices.getUserMedia({
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
  }, []);

  useEffect(() => {
    if (!localStream) return;
    async function initSocketClient() {
      const newSocketClient = await createSocketClient();
      setMyConnectionId(newSocketClient.myConnectionId);
      newSocketClient.addMessageListener(clientNewIceCandidate);
      newSocketClient.addMessageListener((message) => {
        someoneNewJoined(message, newSocketClient);
      });
      newSocketClient.addMessageListener(clientNewAnswer);
      newSocketClient.addMessageListener((message) => {
        clientNewOffer(message, newSocketClient);
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
      initSocketClient();
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
      rtcPeerConnectionManager
        .getPeerConnections()
        .forEach((peerConnection) => {
          const sender = peerConnection.rtcPeerConnection
            .getSenders()
            .find((s) => s.track?.kind === "audio");
          if (sender) {
            sender.replaceTrack(newAudioTrack);
          }
        });
      oldAudioTrack.stop();
      localStream.dispatchEvent(new Event("alltracksadded"));
    }
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
          {localStream && // Used for testing when you have no friends :(
            new Array(totalVideos)
              .fill(undefined)
              .map((_, i) => (
                <VideoComponent
                  key={i}
                  speakerId={speakerId}
                  stream={localStream}
                  local
                />
              ))}
          {/*localStream && (
            <VideoComponent
              speakerId={speakerId}
              key={"local"}
              stream={localStream}
              local
            />
          ) */}
          {peerConnections.map((remoteConnection) => {
            return (
              <>
                <VideoComponent
                  speakerId={speakerId}
                  stream={remoteConnection.remoteMediaStream}
                  key={remoteConnection.peerId}
                />
              </>
            );
          })}
        </div>
        <MediaBar
          onCameraDisable={handleCameraDisableChange}
          speakerId={speakerId}
          onSpeakerChange={setSpeakerId}
          onMicChange={handleMicChange}
          cameraId={cameraId}
          onCameraChange={setCameraId}
          onMicMuteChange={handleMicMuteChange}
        />
      </div>
    </>
  );
}
