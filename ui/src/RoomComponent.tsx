import { useEffect, useState } from "react";
import { VideoComponent } from "./components/VideoComponent";
import { rtcPeerConnectionManager } from "./rtcPeerConnection";

export function RoomComponent() {
  const [localStream, setStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

  useEffect(() => {
    // need to set remote streams
    // We do not want to add multiple listeners every time the component re-renders
    rtcPeerConnectionManager.listeners.push(() => {
      setRemoteStreams(rtcPeerConnectionManager.getRemoteMediaStreams());
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
