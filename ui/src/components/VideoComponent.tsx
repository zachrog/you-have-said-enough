import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

export function VideoComponent({
  stream,
  local,
}: {
  stream: MediaStream | null;
  local?: boolean;
}) {
  const [isTalking, setIsTalking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      if (local) videoRef.current.muted = true;
    }
    // if (stream) {
    //   const audioContext = new AudioContext();
    //   const source = audioContext.createMediaStreamSource(stream);
    //   const analyser = audioContext.createAnalyser();

    //   // Set up the analyser node
    //   analyser.fftSize = 2048;
    //   const bufferLength = analyser.fftSize;
    //   const dataArray = new Uint8Array(bufferLength);

    //   source.connect(analyser);

    //   function analyzeAudio() {
    //     analyser.getByteTimeDomainData(dataArray);

    //     // Calculate the average audio level
    //     let sum = 0;
    //     for (let i = 0; i < bufferLength; i++) {
    //       const value = dataArray[i] / 128 - 1;
    //       sum += value * value;
    //     }
    //     const average = Math.sqrt(sum / bufferLength);

    //     // Determine if the user is speaking
    //     if (average > 0.01) {
    //       // Adjust this threshold as needed
    //       setIsTalking(true);
    //     } else {
    //       setIsTalking(false);
    //     }

    //     requestAnimationFrame(analyzeAudio);
    //   }

    //   analyzeAudio();
    // }
  }, [stream]);

  return (
    <div>
      <video
        className={clsx([
          "aspect-video",
          "bg-gray-800",
          "min-w-28",
          "max-w-90",
          "flex-1",
          "rounded-lg",
          isTalking && "border-emerald-400",
          isTalking && "border-2",
        ])}
        ref={videoRef}
        autoPlay
        playsInline
      />
      {/* {isTalking && <h1>Is Talking!</h1>} */}
    </div>
  );
}
