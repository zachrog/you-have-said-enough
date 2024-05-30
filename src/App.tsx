import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import {CopyTextComponent} from "./textComponent"

function App() {

  const rTCPeerConnnection = new RTCPeerConnection(servers);

  return (
    <>
      <LocalVideoComponent rTCPeerConnnection={rTCPeerConnnection}></LocalVideoComponent>
      <RemoteVideoComponent rTCPeerConnnection={rTCPeerConnnection}></RemoteVideoComponent>
      <RTCOfferComponent rTCPeerConnnection={rTCPeerConnnection}></RTCOfferComponent>
    </>
  );
}

const RTCOfferComponent =  ({rTCPeerConnnection}: {rTCPeerConnnection: RTCPeerConnection}) => {
  const [offer, setOffer] = useState<string>("");
  
  return <>
  <Button onClick={async () => {
    
    const new_offer = await rTCPeerConnnection.createOffer();
    await rTCPeerConnnection.setLocalDescription(new_offer);
    setOffer(JSON.stringify(new_offer));
    }}>Create Offer</Button>
    <CopyTextComponent text={offer}></CopyTextComponent>
  </>
}

const LocalVideoComponent = ({rTCPeerConnnection}: {rTCPeerConnnection: RTCPeerConnection}) => {
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
        rTCPeerConnnection?.addTrack(track, stream)
      })
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

const RemoteVideoComponent = ({rTCPeerConnnection}: {rTCPeerConnnection: RTCPeerConnection}) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!remoteStream) {
      setRemoteStream(new MediaStream())
      // rTCPeerConnnection.ontrack
    } else {
      rTCPeerConnnection.ontrack = event => {
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track)
        })
      }

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

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default App;
