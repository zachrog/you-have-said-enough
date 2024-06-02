import { Button } from "./components/ui/button";
import { closeWebSocket, createWebSocket, sendWebSocket } from "./socketClient";
import { useEffect } from "react";
import { RoomComponent } from "./roomComponent";

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
      <Button onClick={async () => {}}>Create Offer</Button>
    </>
  );
};

export default App;
