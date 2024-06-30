import { Button } from "./components/ui/button";
import {
  allConnectionIds,
  closeWebSocket,
  createWebSocket,
  myConnectionId,
  sendWebSocket,
} from "./socketClient";
import { useEffect } from "react";
import { RoomComponent } from "./RoomComponent";
import { rtcPeerConnectionManager } from "./rtcPeerConnectionManager";
import { SocketClient } from "@/socketClient2";

function App() {
  useEffect(() => {
    const socketClient = new SocketClient(import.meta.env.VITE_WEBSOCKET_URL);
    socketClient.init();

    return () => {
      socketClient.close();
    };
  }, []);
  return (
    <>
      <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
        <RoomComponent></RoomComponent>
        <RTCOfferComponent></RTCOfferComponent>
      </div>
    </>
  );
}

const RTCOfferComponent = () => {
  return (
    <>
      <Button
        onClick={async () => {
          await Promise.all(
            allConnectionIds.map(async (iD: string) => {
              const rtcPeerConnection =
                await rtcPeerConnectionManager.createRtcPeerConnection({
                  peerId: iD,
                  myConnectionId,
                });
              const newOffer = await rtcPeerConnection.createOffer();
              await rtcPeerConnection.setLocalDescription(newOffer);
              sendWebSocket({
                action: "newOffer",
                from: myConnectionId,
                to: iD,
                data: newOffer,
              });
            })
          );
        }}
      >
        Join if you D.A.R.E.
      </Button>
    </>
  );
};

export default App;
