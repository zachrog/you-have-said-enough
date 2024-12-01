import { useEffect, useRef } from "react";
import { clsx } from "clsx";

export function VideoComponent({
  stream,
  local,
  scalar,
  isTalking,
}: {
  scalar: number;
  isTalking: boolean;
  stream: MediaStream;
  local?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef, local, stream]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = local ? 0 : scalar;
    }
  }, [videoRef, scalar, local]);

  return (
    <div className="w-full min-w-0 min-h-0 overflow-hidden">
      <video
        className={clsx([
          "w-full h-full object-cover box-border flex-1 rounded-lg",
          isTalking && "border-emerald-400",
          isTalking && "border-2",
        ])}
        style={{ transform: `scale(${scalar})` }}
        ref={videoRef}
        autoPlay
        playsInline
      />
    </div>
  );
}
