import { ClientWebsocketMessage } from "@/socketClient";
import { ServerWebsocketMessage } from "server/src/socketApi";

export class SocketClient {
  private connectionUrl: string;
  private webSocket: WebSocket;
  private messageListeners: MessageListener[] = [];
  myConnectionId: string = "noId";

  constructor(url: string) {
    this.connectionUrl = url;
    this.webSocket = new WebSocket(this.connectionUrl);
  }

  async init(): Promise<{ myConnectionId: string }> {
    while (this.webSocket.readyState !== 1) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    const connectionIdPromise = new Promise<{ myConnectionId: string }>(
      (resolve) => {
        const connectionIdListener = (event: MessageEvent) => {
          const message: ClientWebsocketMessage = JSON.parse(event.data);
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
    // Need to remove all listeners
    this.webSocket.close();
  }

  addMessageListener(f: MessageListener) {
    this.webSocket.addEventListener("message", f);
  }

  removeMessageListener(f: MessageListener) {
    this.webSocket.removeEventListener("message", f);
  }
}

type MessageListener = (
  message: MessageEvent
) => void | ((message: MessageEvent) => Promise<void>);
