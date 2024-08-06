import { useEffect, useState } from "react";
import { VideoComponent } from "../components/VideoComponent";
import {
  VideoPeerConnection,
  rtcPeerConnectionManager,
} from "../rtcPeerConnectionManager";
import {
  SocketClient,
  getSocketClient,
  someoneNewJoined,
  clientNewIceCandidate,
  clientNewAnswer,
  clientNewOffer,
} from "@/socketClient";
import { MediaBar } from "@/components/MediaBar";

export function RoomPage() {
  const [myConnectionId, setMyConnectionId] = useState<string>("");
  const [localStream, setStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<VideoPeerConnection[]>(
    []
  );
  const [speakerId, setSpeakerId] = useState("");
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
        video: true,
        audio: true,
      });
      setStream(localMediaStream);
      rtcPeerConnectionManager.setLocalMediaStream({ localMediaStream });
    };

    getUserMedia();
  }, []);

  useEffect(() => {
    if (!localStream) return;
    let socketClient: SocketClient;
    const initSocketClient = async () => {
      socketClient = await getSocketClient();
      setMyConnectionId(socketClient.myConnectionId);
      socketClient.addMessageListener(clientNewIceCandidate);
      socketClient.addMessageListener(someoneNewJoined);
      socketClient.addMessageListener(clientNewAnswer);
      socketClient.addMessageListener(clientNewOffer);
      socketClient.sendMessage({
        action: "enterRoom",
        data: "",
        from: "",
        to: "",
      });
    };

    initSocketClient();

    return () => {
      socketClient.close();
    };
  }, [localStream]);

  return (
    <>
      <div className="h-screen w-full flex flex-col justify-between flex-none">
        <div className="h-screen w-full grid grid-cols-3">
          {localStream && // Used for testing when you have no friends :(
            new Array(totalVideos)
              .fill(undefined)
              .map(() => (
                <VideoComponent
                  speakerId={speakerId}
                  stream={localStream}
                  local
                  connectionId={myConnectionId}
                />
              ))}
          {/* {localStream && (
            <VideoComponent
              speakerId={speakerId}
              stream={localStream}
              local
              connectionId={myConnectionId}
            />
          )} */}
          {peerConnections.map((remoteConnection) => {
            return (
              <>
                <VideoComponent
                  speakerId={speakerId}
                  stream={remoteConnection.remoteMediaStream}
                  connectionId={remoteConnection.peerId}
                  key={remoteConnection.peerId}
                />
              </>
            );
          })}
        </div>
        <MediaBar speakerId={speakerId} setSpeakerId={setSpeakerId} />
      </div>
    </>
  );
}
