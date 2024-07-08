import { rtcPeerConnectionManager } from "@/rtcPeerConnectionManager";
import { ServerWebsocketMessage } from "server/src/socketApi";

export type ClientWebsocketMessage = {
  action:
    | "newOffer"
    | "newAnswer"
    | "newIceCandidate"
    | "yourConnectionId"
    | "newUserJoined";
  to: string;
  from: string;
  data: any;
};

let socketClientCache: SocketClient;
export async function getSocketClient(): Promise<SocketClient> {
  if (!socketClientCache) {
    socketClientCache = new SocketClient();
    await socketClientCache.init();
  }

  return socketClientCache;
}

export class SocketClient {
  private webSocket: WebSocket;
  private messageListeners: {
    original: MessageListener;
    parsed: (message: MessageEvent) => void;
  }[] = [];
  private websocketUrl: string = import.meta.env.VITE_WEBSOCKET_URL;
  myConnectionId: string = "noId";

  constructor() {
    this.webSocket = new WebSocket(this.websocketUrl);
  }

  async init(): Promise<{ myConnectionId: string }> {
    while (this.webSocket.readyState !== 1) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    const connectionIdPromise = new Promise<{ myConnectionId: string }>(
      (resolve) => {
        const connectionIdListener = (message: ClientWebsocketMessage) => {
          if (message.action === "yourConnectionId") {
            const myConnectionId = message.data;
            resolve({ myConnectionId });
            this.removeMessageListener(connectionIdListener);
          }
        };

        this.addMessageListener(connectionIdListener);
        this.sendMessage({
          action: "yourConnectionId",
          from: "",
          to: "",
          data: "",
        });
      }
    );
    const connection = await connectionIdPromise;
    this.myConnectionId = connection.myConnectionId;

    return connection;
  }

  sendMessage(message: ServerWebsocketMessage) {
    this.webSocket.send(JSON.stringify(message));
  }

  close() {
    this.messageListeners.forEach((listener) => {
      this.webSocket.removeEventListener("message", listener.parsed);
    });
    this.messageListeners = [];
    this.webSocket.close();
  }

  addMessageListener(f: MessageListener): void {
    const parsedListener = (event: MessageEvent) => {
      const message: ClientWebsocketMessage = JSON.parse(event.data);
      f(message);
    };
    this.messageListeners.push({ original: f, parsed: parsedListener });
    this.webSocket.addEventListener("message", parsedListener);
  }

  removeMessageListener(f: MessageListener): void {
    const index = this.messageListeners.findIndex(
      (listnerObject) => listnerObject.original === f
    );
    if (index) {
      this.messageListeners.splice(index, 1);
    }
  }
}

type MessageListener = (
  message: ClientWebsocketMessage
) => void | Promise<void>;

export async function clientNewIceCandidate(message: ClientWebsocketMessage) {
  if (message.action !== "newIceCandidate") return;
  rtcPeerConnectionManager.addIceCandidates({
    peerId: message.from,
    iceCandidate: message.data,
  });
  await rtcPeerConnectionManager.drainIceCandidates({ peerId: message.from });
}

export async function someoneNewJoined(message: ClientWebsocketMessage) {
  if (message.action !== "newUserJoined") return;
  const socketClient = await getSocketClient();
  const rtcPeerConnection =
    await rtcPeerConnectionManager.createRtcPeerConnection({
      peerId: message.from,
      myConnectionId: socketClient.myConnectionId,
    });
  const newOffer = await rtcPeerConnection.createOffer();
  await rtcPeerConnection.setLocalDescription(newOffer);
  socketClient.sendMessage({
    action: "newOffer",
    from: socketClient.myConnectionId,
    to: message.from,
    data: newOffer,
  });
}

export async function clientNewAnswer(message: ClientWebsocketMessage) {
  if (message.action !== "newAnswer") return;
  const rTCPeerConnection = rtcPeerConnectionManager.get({
    peerId: message.from,
  });
  if (!rTCPeerConnection) {
    console.log("no peer connection for newAnswer");
    return;
  }
  await rTCPeerConnection.setRemoteDescription(message.data);
  rtcPeerConnectionManager.setReadyToForwardRemoteIceCandidates({
    isReady: true,
    peerId: message.from,
  });
  await rtcPeerConnectionManager.drainIceCandidates({ peerId: message.from });
}

export async function clientNewOffer(message: ClientWebsocketMessage) {
  if (message.action !== "newOffer") return;
  const socketClient = await getSocketClient();
  const rTCPeerConnection = rtcPeerConnectionManager.createRtcPeerConnection({
    peerId: message.from,
    myConnectionId: socketClient.myConnectionId,
  });
  await rTCPeerConnection.setRemoteDescription(
    new RTCSessionDescription(message.data)
  );
  const answer = await rTCPeerConnection.createAnswer();
  await rTCPeerConnection.setLocalDescription(answer);
  socketClient.sendMessage({
    action: "newAnswer",
    to: message.from,
    from: socketClient.myConnectionId,
    data: answer,
  });
  rtcPeerConnectionManager.setReadyToForwardRemoteIceCandidates({
    isReady: true,
    peerId: message.from,
  });
  await rtcPeerConnectionManager.drainIceCandidates({ peerId: message.from });
}
