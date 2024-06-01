import { useEffect, useRef, useState } from "react";
// import { rTCPeerConnnection } from "@/rtcPeerConnection";

export function LocalVideoComponent() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
  
    useEffect(() => {
      const getUserMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(stream);
      };
  
      if (!stream) {
        getUserMedia();
      } else {
        // stream.getTracks().forEach((track) => {
        //   rTCPeerConnnection?.addTrack(track, stream);
        // });
        // if (videoRef.current) {
        //   videoRef.current.srcObject = stream;
        // }
      }
  
      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        }
      };
    }, [stream]);
  
    return (
      <div>
        <h1>Local Video</h1>
        <video className="h-300 w-900" ref={videoRef} autoPlay playsInline />
      </div>
    );
}
