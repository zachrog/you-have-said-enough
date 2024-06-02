import { useRef } from "react";

export function VideoComponent({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  if (videoRef.current && stream) {
    videoRef.current.srcObject = stream;
  }
  return (
    <div className="aspect-video bg-gray-800 min-w-28 max-w-90 flex-1">
      <video className="rounded-lg" ref={videoRef} autoPlay playsInline />
    </div>
  );
}
