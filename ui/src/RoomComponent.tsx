import { useEffect, useState } from "react";
import { VideoComponent } from "./components/VideoComponent";
import { rtcPeerConnectionManager } from "./rtcPeerConnection";
import { Button } from "./components/ui/button";

export function RoomComponent() {
  const [someNum, setSomeNum] = useState(7);
  const [localStream, setStream] = useState<MediaStream | null>(null);
  const remoteStreams = rtcPeerConnectionManager.getRemoteMediaStreams();

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
  }, [localStream]);

  return (
    <>
      <Button onClick={() => setSomeNum(someNum + 1)}>ReRender Room</Button>
      <div className="flex gap-4 p-4 flex-wrap">
        <VideoComponent stream={localStream} local />
        {remoteStreams.map((remoteStream) => {
          return (
            <>
              <VideoComponent stream={remoteStream} />
            </>
          );
        })}
      </div>
    </>
  );
}
