import { useEffect, useRef } from "react";
import { clsx } from "clsx";

export function VideoComponent({
  stream,
  local,
  scaler,
  isTalking,
}: {
  scaler: number;
  isTalking: boolean;
  stream: MediaStream;
  local?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      if (local) videoRef.current.volume = 0;
    }
  }, [videoRef, local, stream]);

  useEffect(() => {
    if (videoRef.current && !local) {
      videoRef.current.volume = scaler;
    }
  }, [videoRef, scaler, local]);

  return (
    <div className="w-full min-w-0 min-h-0 overflow-hidden">
      <video
        className={clsx([
          "w-full h-full object-cover box-border flex-1 rounded-lg",
          isTalking && "border-emerald-400",
          isTalking && "border-2",
        ])}
        style={{ transform: `scale(${scaler})` }}
        ref={videoRef}
        autoPlay
        playsInline
      />
    </div>
  );
}
