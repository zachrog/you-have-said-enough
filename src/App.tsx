import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  return (
    <>
      <CameraComponent></CameraComponent>
    </>
  );
}

const CameraComponent = () => {
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
      console.log("NO STREAM");
      getUserMedia();
    } else {
      console.log("Stream!");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
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
      <h1>Camera Component</h1>
      <video className="h-100 w-64" ref={videoRef} autoPlay playsInline />
    </div>
  );
};

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default App;
