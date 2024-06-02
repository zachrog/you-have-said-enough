import { useEffect, useState } from "react";
import { RemoteVideoComponent } from "./RemoteVideoComponent";
import { LocalVideoComponent } from "./LocalVideoComponent";
import { rtcPeerConnectionManager } from "./rtcPeerConnection";

export function RoomComponent() {
  const [localStream, setStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

  /* 
  1. Listen for when a new RTC peerConnection is made.
   2. When it is made add the local stream tracks
   3. add the remote stream tracks
  */
  rtcPeerConnectionManager.onCreateRtcPeerConnection((rtcPeerConnection) => {
    if (localStream) {
      localStream
        .getTracks()
        .forEach((track) => rtcPeerConnection.addTrack(track));
    }
    rtcPeerConnection.ontrack = (event) => {
      const remoteMediaStream = new MediaStream();
      event.streams[0].getTracks().forEach((track) => {
        remoteMediaStream.addTrack(track);
      });
      setRemoteStreams([...remoteStreams, remoteMediaStream]);
    };
  });

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
    }

    // return () => {
    //   if (localStream) {
    //     localStream.getTracks().forEach((track) => track.stop());
    //   }
    //   remoteStreams.forEach((remoteStream) => {
    //     remoteStream.getTracks().forEach((track) => track.stop());
    //   });
    // };
  }, [localStream, remoteStreams]);

  return (
    <>
      <LocalVideoComponent localStream={localStream}></LocalVideoComponent>
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
