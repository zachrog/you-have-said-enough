import { useEffect, useRef, useState } from "react";
import { AllRemoteVideosComponent } from "./AllRemoteVideosComponent";
import { LocalVideoComponent } from "./LocalVideoComponent";

export function RoomComponent() {
  const [localStream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getUserMedia = async () => {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(localStream);
    };

    if (!localStream) {
      getUserMedia();
    } else {
      //   localStream.getTracks().forEach((track) => {
      //     rTCPeerConnnection?.addTrack(track, localStream);
      //   });
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [localStream]);
  return (
    <>
      <LocalVideoComponent localStream={localStream}></LocalVideoComponent>
      <AllRemoteVideosComponent></AllRemoteVideosComponent>
    </>
  );
}
