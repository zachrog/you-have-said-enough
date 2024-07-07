import { useEffect, useState } from "react";
import { VideoComponent } from "./components/VideoComponent";
import {
  VideoPeerConnection,
  rtcPeerConnectionManager,
} from "./rtcPeerConnectionManager";
import {
  SocketClient,
  getSocketClient,
  someoneNewJoined,
  clientNewIceCandidate,
  clientNewAnswer,
  clientNewOffer,
} from "@/socketClient";

export function RoomComponent() {
  const [myConnectionId, setMyConnectionId] = useState<string>("");
  const [localStream, setStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<VideoPeerConnection[]>(
    []
  );

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
      <div className="flex gap-4 p-4 flex-wrap">
        {localStream && (
          <VideoComponent
            stream={localStream}
            local
            connectionId={`me: ${myConnectionId}`}
          />
        )}
        {peerConnections.map((remoteConnection) => {
          return (
            <>
              <VideoComponent
                stream={remoteConnection.remoteMediaStream}
                connectionId={remoteConnection.peerId}
                key={remoteConnection.peerId}
              />
            </>
          );
        })}
      </div>
    </>
  );
}
