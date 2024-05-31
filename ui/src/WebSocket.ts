export function createWebSocket() {
  const webSocketUrl = import.meta.env.VITE_WEBSOCKET_URL;

  console.log(webSocketUrl);
  if (!webSocketUrl) {
    throw new Error("No websocket url");
  }
  const webSocket = new WebSocket(webSocketUrl);

  webSocket.onerror = (event) => {
    console.log("on error : ", event);
  };

  webSocket.onmessage = (event) => {
    console.log("bitch we socket :", event);
  };

  webSocket.onopen = (event) => {
    console.log(event);
  };

  return webSocket;
}
