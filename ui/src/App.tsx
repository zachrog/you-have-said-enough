import { Button } from "./components/ui/button";
import {
  allConnectionIds,
  closeWebSocket,
  createWebSocket,
  myConnectionId,
  sendWebSocket,
} from "./socketClient";
import { useEffect } from "react";
import { RoomComponent } from "./roomComponent";
import { rtcPeerConnectionManager } from "./rtcPeerConnection";

function App() {
  useEffect(() => {
    createWebSocket().then(() => {
      sendWebSocket({ action: "enterRoom", data: "", from: "", to: "" });
    });
    return () => {
      closeWebSocket();
    };
  }, []);
  return (
    <>
      <RoomComponent></RoomComponent>
      <RTCOfferComponent></RTCOfferComponent>
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
              console.log("creating new offer");
              const newOffer = await rtcPeerConnection.createOffer();
              console.log(newOffer);
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
