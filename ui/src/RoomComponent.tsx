import { useEffect, useState } from "react";
import { VideoComponent } from "./components/VideoComponent";
import {
  VideoPeerConnection,
  rtcPeerConnectionManager,
} from "./rtcPeerConnection";
import { myConnectionId } from "@/socketClient";

export function RoomComponent() {
  const [localStream, setStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<VideoPeerConnection[]>([]);

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

    if (!localStream) {
      getUserMedia();
    }
  }, []);

  return (
    <>
      <div className="flex gap-4 p-4 flex-wrap">
        <VideoComponent
          stream={localStream}
          local
          connectionId={`me: ${myConnectionId}`}
        />
        {peerConnections.map((remoteConnection) => {
          return (
            <>
              <VideoComponent
                stream={remoteConnection.remoteMediaStream}
                connectionId={remoteConnection.peerId}
              />
            </>
          );
        })}
      </div>
    </>
  );
}
