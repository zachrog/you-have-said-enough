import { useRef } from "react";

export function RemoteVideoComponent({
  remoteStream,
}: {
  remoteStream: MediaStream;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (videoRef.current) {
    videoRef.current.srcObject = remoteStream;
  }

  return (
    <div>
      <h1>Remote Component</h1>
      <video className="h-300 w-900" ref={videoRef} autoPlay playsInline />
    </div>
  );
}
