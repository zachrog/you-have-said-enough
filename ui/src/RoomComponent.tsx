import { useEffect, useState } from "react";
import { RemoteVideoComponent } from "./RemoteVideoComponent";
import { LocalVideoComponent } from "./LocalVideoComponent";
import { rtcPeerConnectionManager } from "./rtcPeerConnection";
import { Button } from "./components/ui/button";

export function RoomComponent() {
  const [someNum, setSomeNum] = useState(7);
  const [stream, setStream] = useState<MediaStream | null>(null);
  //   const localStream = rtcPeerConnectionManager.getLocalMediaStream();
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

    if (!stream) {
      getUserMedia();
    }
  }, [stream]);

  return (
    <>
      <Button onClick={() => setSomeNum(someNum + 1)}>ReRender Room</Button>
      <LocalVideoComponent localStream={stream}></LocalVideoComponent>
      {remoteStreams.map((remoteStream) => {
        return (
          <>
            <RemoteVideoComponent
              remoteStream={remoteStream}
            ></RemoteVideoComponent>
          </>
        );
      })}
    </>
  );
}
