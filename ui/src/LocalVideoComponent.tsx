import { useEffect, useRef } from "react";
// import { rTCPeerConnnection } from "@/rtcPeerConnection";

export function LocalVideoComponent({
  localStream,
}: {
  localStream: MediaStream | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  if (videoRef.current && localStream) {
    videoRef.current.srcObject = localStream;
  }
  return (
    <div>
      <h1>Local Video</h1>
      <video className="h-300 w-900" ref={videoRef} autoPlay playsInline />
    </div>
  );
}
