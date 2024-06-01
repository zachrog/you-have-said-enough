import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { storeConnection } from "./storeConnection";
import { removeConnection } from "./removeConnection";
import { broadcastToRoom } from "./broadcastToRoom";

type WebSocketReturn = {
  statusCode: number;
};

export type ServerWebsocketMessage = {
  action: "sendOffer" | "sendAnswer" | "newIceCandidate";
  data: any;
};

export async function connectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("connect event: ", event);
  await storeConnection(event.requestContext.connectionId);
  return { statusCode: 200 };
}

export async function disconnectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("disconnect event: ", event);
  await removeConnection(event.requestContext.connectionId);
  return { statusCode: 200 };
}

export async function defaultHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("default event: ", event);
  const message: ServerWebsocketMessage = JSON.parse(event.body!);
  switch (message.action) {
    case "sendOffer":
      await broadcastToRoom({
        myConnectionId: event.requestContext.connectionId,
        message: { action: "newOffer", data: message.data },
      });
      break;
    case "sendAnswer":
      await broadcastToRoom({
        myConnectionId: event.requestContext.connectionId,
        message: { action: "newAnswer", data: message.data },
      });
      break;
    case "newIceCandidate":
      await broadcastToRoom({
        myConnectionId: event.requestContext.connectionId,
        message: { action: "newIceCandidate", data: message.data },
      });
      break;
    default:
      throw new Error("unknown action in message");
  }
  return { statusCode: 200 };
}
