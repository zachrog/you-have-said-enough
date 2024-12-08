import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { calculateScalingProportion } from "@/lib/audioStatistics";

export function VideoComponent({
  stream,
  local,
  audioWindow,
}: {
  stream: MediaStream;
  audioWindow: number;
  local?: boolean;
}) {
  const [isTalking, setIsTalking] = useState(false);
  const [scalingProportion, setScalingProportion] = useState(1);
  const [trackId, setTrackId] = useState(0.263); // This is a janky way to trigger useEffect to run again when the microphone has changed and so the analyzer needs to restart.
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      if (local) videoRef.current.volume = 0;
    }
  }, [videoRef, local, stream]);

  useEffect(() => {
    if (videoRef.current && !local) {
      videoRef.current.volume = scalingProportion;
    }
  }, [videoRef, scalingProportion, local]);

  useEffect(() => {
    const audioContext = new AudioContext();
    let animationFrameId: number;

    function attachAudioAnalyzer() {
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      // Set up the analyser node
      analyser.fftSize = 2048;
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      let timeOfLastSample = performance.now();
      let timeTalkingInWindow = 0;
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
        const now = performance.now();
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
        while (lastEvaluatedPeriod < now - audioWindow) {
          const deletedEntry = speechHistory.shift()!;
          lastEvaluatedPeriod = speechHistory[0].recordedAt;
          timeTalkingInWindow =
            timeTalkingInWindow - deletedEntry.timeSpentTalking;
        }

        setScalingProportion(
          calculateScalingProportion({
            evaluationWindow: audioWindow,
            timeTalkingInWindow,
          })
        );
        timeOfLastSample = now;
        animationFrameId = requestAnimationFrame(analyzeAudio); // Does this create a perpetual loop even if we add a new mic?
      }

      analyzeAudio();
    }

    if (stream.active) {
      attachAudioAnalyzer();
    }
    function audioTrackAddedListener() {
      setTrackId(Math.random());
    }
    stream.addEventListener("audioTrackAdded", audioTrackAddedListener); // Remote streams have tracks added later on.

    return () => {
      stream.removeEventListener("audioTrackAdded", audioTrackAddedListener);
      audioContext.close().catch((e) => console.error(e));
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [trackId, audioWindow, stream]);

  return (
    <div className="w-full min-w-0 min-h-0 overflow-hidden">
      <video
        className={clsx([
          "w-full h-full object-cover box-border flex-1 rounded-lg",
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
