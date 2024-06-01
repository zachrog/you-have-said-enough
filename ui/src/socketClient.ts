import { rTCPeerConnnection } from "@/rtcPeerConnection";
import { ServerWebsocketMessage } from "server/src/socketApi";

export type ClientWebsocketMessage = {
  action: "newOffer" | "newAnswer";
  data: any;
};

const webSocket = createWebSocket();

export function createWebSocket() {
  const webSocketUrl = import.meta.env.VITE_WEBSOCKET_URL;

  console.log(webSocketUrl);
  if (!webSocketUrl) {
    throw new Error("No websocket url");
  }
  const newWebSocket = new WebSocket(webSocketUrl);

  newWebSocket.onerror = (event) => {
    console.log("on error : ", event);
  };

  newWebSocket.onmessage = async (event) => {
    const message: ClientWebsocketMessage = JSON.parse(event.data);
    switch (message.action) {
      case "newOffer":
        rTCPeerConnnection.setRemoteDescription(
          new RTCSessionDescription(message.data)
        );
        const answer = await rTCPeerConnnection.createAnswer();
        await rTCPeerConnnection.setLocalDescription(answer);
        sendWebSocket({ action: "sendAnswer", data: answer });
        break;
      case "newAnswer":
        await rTCPeerConnnection.setRemoteDescription(message.data);
        break;
      default:
        break;
    }
  };

  newWebSocket.onopen = (event) => {
    console.log(event);
  };

  return newWebSocket;
}

export function closeWebSocket() {
  webSocket.close();
}

export function sendWebSocket(message: ServerWebsocketMessage) {
  webSocket.send(JSON.stringify(message));
}
