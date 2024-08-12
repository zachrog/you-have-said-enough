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
  const [micId, setMicId] = useState("default");
  const [isMuted, setIsMuted] = useState(false);
  const [cameraIsDisabled, setCameraIsDisabled] = useState(false);
  const totalVideos = 9;

  useEffect(() => {
    // need to set remote streams
    // We do not want to add multiple listeners every time the component re-renders
    rtcPeerConnectionManager.listeners.push(() => {
      setPeerConnections(rtcPeerConnectionManager.getPeerConnections());
    });
  }, []);

  useEffect(() => {
    const getUserMedia = async () => {
      const localMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: 16 / 9,
        },
        audio: true,
      });
      setLocalStream(localMediaStream);
      rtcPeerConnectionManager.setLocalMediaStream({ localMediaStream });
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
    setIsMuted(isMuted);
  }

  function handleCameraDisableChange(isDisabled: boolean) {
    const localVideoTrack = localStream?.getVideoTracks()?.[0];
    if (localVideoTrack) {
      localVideoTrack.enabled = !isDisabled;
    }
    setCameraIsDisabled(isDisabled);
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
    }
    setMicId(micId);
  }

  return (
    <>
      <div className="h-screen w-full flex flex-col justify-between">
        <div className="w-full h-full grid grid-cols-3 overflow-hidden">
          {localStream && // Used for testing when you have no friends :(
            new Array(totalVideos)
              .fill(undefined)
              .map((_, i) => (
                <VideoComponent
                  micId={micId}
                  key={i}
                  speakerId={speakerId}
                  stream={localStream}
                  local
                />
              ))}
          {/* {localStream && (
            <VideoComponent
              speakerId={speakerId}
              micId={micId}
              key={"local"}
              stream={localStream}
              local
            />
          )} */}
          {peerConnections.map((remoteConnection) => {
            return (
              <>
                <VideoComponent
                  micId={micId}
                  speakerId={speakerId}
                  stream={remoteConnection.remoteMediaStream}
                  key={remoteConnection.peerId}
                />
              </>
            );
          })}
        </div>
        <MediaBar
          cameraIsDisabled={cameraIsDisabled}
          onCameraDisable={handleCameraDisableChange}
          speakerId={speakerId}
          onSpeakerChange={setSpeakerId}
          micId={micId}
          onMicChange={handleMicChange}
          cameraId={cameraId}
          onCameraChange={setCameraId}
          isMuted={isMuted}
          onMicMuteChange={handleMicMuteChange}
        />
      </div>
    </>
  );
}
