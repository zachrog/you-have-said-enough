import { rTCPeerConnnection } from '@/rtcPeerConnection';

export type WebSocketMessage = {
  action: string;
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
    console.log("bitch we socket :", event);
    const message: WebSocketMessage = JSON.parse(event.data);
    switch (message.action) {
      case "newOffer":
        rTCPeerConnnection.setRemoteDescription(
          new RTCSessionDescription(message.data)
        );
        const answer = await rTCPeerConnnection.createAnswer();
        await rTCPeerConnnection.setLocalDescription(answer);

        sendWebSocket({ action: "storeAnswer", data: answer });
        // .send({ answer: answer });
        break;
      case "newAnswer":
        console.log("got answer");
        await rTCPeerConnnection.setRemoteDescription(message.data);

        break;
      default:
        break;
    }
    //
  };

  newWebSocket.onopen = (event) => {
    console.log(event);
  };

  return newWebSocket;
}

export function closeWebSocket() {
  webSocket.close();
}

export function sendWebSocket(message: WebSocketMessage) {
  webSocket.send(JSON.stringify(message));
}
