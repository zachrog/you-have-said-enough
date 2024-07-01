import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

export function VideoComponent({
  stream,
  local,
  connectionId,
}: {
  stream: MediaStream | null;
  connectionId: string;
  local?: boolean;
}) {
  const [isTalking, setIsTalking] = useState(false);
  const [timeTalking, setTimeTalking] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const averageWindow = 5000;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      if (local) videoRef.current.muted = true;
    }
  }, [stream]);

  useEffect(() => {
    if (stream && !local) {
      stream.addEventListener("alltracksadded", () => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        // Set up the analyser node
        analyser.fftSize = 2048;
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        let timeOfLastSample = 0;
        let timeSpentGatheringData = 0;
        function analyzeAudio() {
          analyser.getByteTimeDomainData(dataArray);

          // Calculate the average audio level
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i] / 128 - 1;
            sum += value * value;
          }
          const average = Math.sqrt(sum / bufferLength);

          // Determine if the user is speaking
          const now = Date.now();
          const timeBetweenSamps = now - timeOfLastSample;
          if (average > 0.01) {
            // Adjust this threshold as needed
            setIsTalking(true);
            setTimeTalking(timeTalking + timeBetweenSamps);
          } else {
            if (timeSpentGatheringData > averageWindow) {
              // setTimeTalking(Math.max(0, timeTalking - timeBetweenSamps));
            }
            setIsTalking(false);
          }
          timeOfLastSample = now;
          timeSpentGatheringData = timeSpentGatheringData + timeBetweenSamps;

          requestAnimationFrame(analyzeAudio);
        }

        analyzeAudio();
      });
    }
  }, [stream]);

  return (
    <div>
      <p>ConnectionId {connectionId}</p>
      <p>Time spent talking {timeTalking}</p>
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
    </div>
  );
}
