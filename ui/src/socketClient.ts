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
  roomId: string;
};

export async function createSocketClient(): Promise<SocketClient> {
  const socketClient = new SocketClient();
  await socketClient.init();
  return socketClient;
}

export class SocketClient {
  private webSocket: WebSocket;
  private messageListeners: {
    original: MessageListener;
    parsed: (message: MessageEvent) => void;
  }[] = [];
  private websocketUrl: string = import.meta.env.VITE_WEBSOCKET_URL; // Looks similar to wss://xxxxxx.execute-api.us-east-1.amazonaws.com/$default
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
          roomId: "",
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
    // Sometimes We receive an icecandidate before we have created a peer connection. Messages Happen out of order.
    peerId: message.from,
    iceCandidate: message.data,
  });
  await rtcPeerConnectionManager.drainIceCandidates({ peerId: message.from });
}

export async function someoneNewJoined(
  message: ClientWebsocketMessage,
  socketClient: SocketClient
) {
  if (message.action !== "newUserJoined") return;
  const rtcPeerConnection =
    await rtcPeerConnectionManager.createRtcPeerConnection({
      peerId: message.from,
      myConnectionId: socketClient.myConnectionId,
      roomId: message.roomId,
      socketClient,
    });
  const newOffer = await rtcPeerConnection.createOffer();
  socketClient.sendMessage({
    roomId: message.roomId,
    action: "newOffer",
    from: socketClient.myConnectionId,
    to: message.from,
    data: newOffer,
  });
  await rtcPeerConnection.setLocalDescription(newOffer);
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

export async function clientNewOffer(
  message: ClientWebsocketMessage,
  socketClient: SocketClient
) {
  if (message.action !== "newOffer") return;
  const rTCPeerConnection = rtcPeerConnectionManager.createRtcPeerConnection({
    peerId: message.from,
    myConnectionId: socketClient.myConnectionId,
    roomId: message.roomId,
    socketClient,
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
    roomId: message.roomId,
  });
  rtcPeerConnectionManager.setReadyToForwardRemoteIceCandidates({
    isReady: true,
    peerId: message.from,
  });
  await rtcPeerConnectionManager.drainIceCandidates({ peerId: message.from });
}
