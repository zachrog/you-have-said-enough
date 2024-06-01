import {
  createRTCPeerConnection,
  rTCPeerConnections,
} from "@/rtcPeerConnection";
import { ServerWebsocketMessage } from "server/src/socketApi";

export type ClientWebsocketMessage = {
  action:
    | "newOffer"
    | "newAnswer"
    | "newIceCandidate"
    | "allConnectionIds"
    | "yourConnectionId";
  to: string;
  from: string;
  data: any;
};

let webSocket: WebSocket;
let myConnectionId: string = "noId";

export async function createWebSocket(): Promise<void> {
  const webSocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
  const returnedPromise = new Promise<void>((resolve, reject) => {
    if (!webSocketUrl) {
      throw new Error("No websocket url");
    }
    webSocket = new WebSocket(webSocketUrl);

    webSocket.onerror = (event) => {
      console.log("on error : ", event);
      reject(event);
    };

    webSocket.onmessage = async (event) => {
      const message: ClientWebsocketMessage = JSON.parse(event.data);
      switch (message.action) {
        case "newOffer":
          await clientNewOffer(message);
          break;
        case "newAnswer":
          await clientNewAnswer(message);
          break;
        case "newIceCandidate":
          await clientNewIceCandidate(message);
          break;
        case "allConnectionIds":
          await Promise.all(
            message.data.map(async (iD: string) => {
              const rtcPeerConnection = createRTCPeerConnection(
                iD,
                myConnectionId
              );
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
          break;
        case "yourConnectionId":
          myConnectionId = message.data;
          break;
        default:
          break;
      }
    };

    webSocket.onopen = (event) => {
      console.log("I am connected!", event);
      resolve();
    };
  });
  return returnedPromise;
}

async function clientNewIceCandidate(message: ClientWebsocketMessage) {
  const rTCPeerConnection = rTCPeerConnections.get(message.from);
  if (!rTCPeerConnection) {
    console.log("no peer connection for newIceCandidate");
    return;
  }
  try {
    await rTCPeerConnection.addIceCandidate(message.data);
  } catch (e) {
    console.log("ice candidate error:", e);
  }
}

async function clientNewAnswer(message: ClientWebsocketMessage) {
  const rTCPeerConnection = rTCPeerConnections.get(message.from);
  if (!rTCPeerConnection) {
    console.log("no peer connection for newAnswer");
    return;
  }
  await rTCPeerConnection.setRemoteDescription(message.data);
}

async function clientNewOffer(message: ClientWebsocketMessage) {
  const rTCPeerConnection = createRTCPeerConnection(
    message.from,
    myConnectionId
  );
  rTCPeerConnection.setRemoteDescription(
    new RTCSessionDescription(message.data)
  );
  const answer = await rTCPeerConnection.createAnswer();
  await rTCPeerConnection.setLocalDescription(answer);
  sendWebSocket({
    action: "newAnswer",
    to: message.from,
    from: myConnectionId,
    data: answer,
  });
  return rTCPeerConnection;
}

export function closeWebSocket() {
  webSocket.close();
}

export function sendWebSocket(message: ServerWebsocketMessage) {
  webSocket.send(JSON.stringify(message));
}
