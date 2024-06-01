import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { storeConnection } from "./storeConnection";
import { removeConnection } from "./removeConnection";
import { storeOffer } from "./offers";
import { broadcastToRoom } from "./broadcastToRoom";

type WebSocketReturn = {
  statusCode: number;
};

export type ServerWebsocketMessage = {
  action: "storeOffer" | "storeAnswer";
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
    case "storeOffer":
      await storeOffer({
        connectionId: event.requestContext.connectionId,
        offer: message.data,
      });
      break;
    case "storeAnswer":
      await broadcastToRoom({
        myConnectionId: event.requestContext.connectionId,
        message: { action: "newAnswer", data: message.data },
      });
      break;
    default:
      throw new Error("unknown action in message");
  }
  return { statusCode: 200 };
}
