const webSocket = createWebSocket();

export type WebSocketMessage = {
  action: string;
  data: any;
};

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

  newWebSocket.onmessage = (event) => {
    console.log("bitch we socket :", event);
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
