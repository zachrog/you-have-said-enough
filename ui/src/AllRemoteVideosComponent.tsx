export function AllRemoteVideosComponent() {
    
    return <></>
}

// const RemoteVideoComponent = () => {
//     const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//     const videoRef = useRef<HTMLVideoElement>(null);
//     console.log("RemoteVideoComponent rerender");
  
//     useEffect(() => {
//       if (!remoteStream) {
//         setRemoteStream(new MediaStream());
//       } else {
//         rTCPeerConnnection.ontrack = (event) => {
//           console.log("Remote Video Component receiving new track");
//           event.streams[0].getTracks().forEach((track) => {
//             remoteStream.addTrack(track);
//           });
//         };
  
//         if (videoRef.current) {
//           videoRef.current.srcObject = remoteStream;
//         }
//       }
  
//       return () => {
//         if (remoteStream) {
//           remoteStream.getTracks().forEach((track) => {
//             track.stop();
//           });
//         }
//       };
//     }, [remoteStream]);
  
//     return (
//       <div>
//         <h1>Remote Component</h1>
//         <video className="h-300 w-900" ref={videoRef} autoPlay playsInline />
//       </div>
//     );
//   };