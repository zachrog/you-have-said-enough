import { ServerWebsocketMessage } from "server/src/socketApi";
import { rtcPeerConnectionManager } from "./rtcPeerConnection";

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
export let myConnectionId: string = "noId";
export let allConnectionIds: string[] = [];

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
          allConnectionIds = message.data;
          break;
        case "yourConnectionId":
          myConnectionId = message.data;
          break;
        default:
          break;
      }
    };

    webSocket.onopen = (event) => {
      resolve();
    };
  });
  return returnedPromise;
}

async function clientNewIceCandidate(message: ClientWebsocketMessage) {
  const rTCPeerConnection = rtcPeerConnectionManager.get({
    peerId: message.from,
  });
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
  const rTCPeerConnection = rtcPeerConnectionManager.get({
    peerId: message.from,
  });
  if (!rTCPeerConnection) {
    console.log("no peer connection for newAnswer");
    return;
  }
  await rTCPeerConnection.setRemoteDescription(message.data);
}

async function clientNewOffer(message: ClientWebsocketMessage) {
  const rTCPeerConnection = rtcPeerConnectionManager.createRtcPeerConnection({
    peerId: message.from,
    myConnectionId,
  });
  await rTCPeerConnection.setRemoteDescription(
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
