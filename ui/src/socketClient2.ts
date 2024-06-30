import { ClientWebsocketMessage } from "@/socketClient";
import { ServerWebsocketMessage } from "server/src/socketApi";

export class SocketClient {
  private connectionUrl: string;
  private webSocket: WebSocket;
  private messageListeners: {
    original: MessageListener;
    parsed: (message: MessageEvent) => void;
  }[] = [];
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
) => void | ((message: ClientWebsocketMessage) => Promise<void>);
