import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { sendWebSocket } from "./socketClient";
import { rTCPeerConnnection } from "@/rtcPeerConnection";

function App() {
  return (
    <>
      <LocalVideoComponent></LocalVideoComponent>
      <RemoteVideoComponent></RemoteVideoComponent>
      <RTCOfferComponent></RTCOfferComponent>
    </>
  );
}

const RTCOfferComponent = () => {

  return (
    <>
      <Button
        onClick={async () => {
          const newOffer = await rTCPeerConnnection.createOffer();
          await rTCPeerConnnection.setLocalDescription(newOffer);
          sendWebSocket({ action: "sendOffer", data: newOffer });
        }}
      >
        Create Offer
      </Button>
    </>
  );
};

const LocalVideoComponent = () => {
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
      getUserMedia();
    } else {
      stream.getTracks().forEach((track) => {
        rTCPeerConnnection?.addTrack(track, stream);
      });
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
      <h1>Local Video</h1>
      <video className="h-300 w-900" ref={videoRef} autoPlay playsInline />
    </div>
  );
};

const RemoteVideoComponent = () => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  console.log("RemoteVideoComponent rerender");

  useEffect(() => {
    if (!remoteStream) {
      setRemoteStream(new MediaStream());
    } else {
      rTCPeerConnnection.ontrack = (event) => {
        console.log("Remote Video Component receiving new track");
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
    }

    return () => {
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [remoteStream]);

  return (
    <div>
      <h1>Remote Component</h1>
      <video className="h-300 w-900" ref={videoRef} autoPlay playsInline />
    </div>
  );
};

export default App;
