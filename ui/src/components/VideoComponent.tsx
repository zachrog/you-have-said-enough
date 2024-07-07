import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { calculateScalingProportion } from "@/lib/audioStatistics";

export function VideoComponent({
  stream,
  local,
  connectionId,
}: {
  stream: MediaStream;
  connectionId: string;
  local?: boolean;
}) {
  const [isTalking, setIsTalking] = useState(false);
  const [timeTalkingDisplay, setTimeTalking] = useState(0);
  const [scalingProportion, setScalingProportion] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      if (local) videoRef.current.volume = 0;
    }
  }, [videoRef]);

  useEffect(() => {
    if (videoRef.current && !local) {
      videoRef.current.volume = scalingProportion;
    }
  }, [videoRef, scalingProportion]);

  useEffect(() => {
    if (local) {
      attachAudioAnalyzer();
    } else {
      stream.addEventListener("alltracksadded", attachAudioAnalyzer); // Remote streams have tracks added later on.
    }

    function attachAudioAnalyzer() {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      // Set up the analyser node
      analyser.fftSize = 2048;
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      let timeOfLastSample = 0;
      let timeTalkingInWindow = 0;
      const evaluationWindow = 5000;
      const speechHistory: { timeSpentTalking: number; recordedAt: number }[] =
        [];
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
        const userWasTalking = average > 0.01;
        const timeSpentTalking = userWasTalking ? timeBetweenSamps : 0;
        timeTalkingInWindow = timeTalkingInWindow + timeSpentTalking;
        setIsTalking(userWasTalking);
        speechHistory.push({
          recordedAt: now,
          timeSpentTalking,
        });

        let lastEvaluatedPeriod = speechHistory[0].recordedAt;
        while (lastEvaluatedPeriod < now - evaluationWindow) {
          const deletedEntry = speechHistory.shift()!;
          lastEvaluatedPeriod = speechHistory[0].recordedAt;
          timeTalkingInWindow =
            timeTalkingInWindow - deletedEntry.timeSpentTalking;
        }

        setScalingProportion(
          calculateScalingProportion({
            evaluationWindow,
            timeTalkingInWindow,
          })
        );
        setTimeTalking(timeTalkingInWindow);
        timeOfLastSample = now;
        requestAnimationFrame(analyzeAudio);
      }

      analyzeAudio();
    }

    return () =>
      stream.removeEventListener("alltracksadded", attachAudioAnalyzer);
  }, []);

  return (
    <div>
      <p>ConnectionId {connectionId}</p>
      <p>Time spent talking {timeTalkingDisplay}</p>
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
        style={{ transform: `scale(${scalingProportion})` }}
        ref={videoRef}
        autoPlay
        playsInline
      />
    </div>
  );
}
