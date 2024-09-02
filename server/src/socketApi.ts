import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { removeConnection } from "./dynamo/removeConnection";
import { sendWebsocketMessage } from "./broadcastToRoom";
import { enterRoom } from "./enterRoom";

export type WebSocketReturn = {
  statusCode: number;
};

export type ServerWebsocketMessage = {
  action:
    | "newOffer"
    | "newAnswer"
    | "newIceCandidate"
    | "enterRoom"
    | "yourConnectionId";
  to: string;
  from: string;
  data: any;
  roomId: string;
};

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
    case "yourConnectionId":
      await sendWebsocketMessage({
        message: {
          to: event.requestContext.connectionId,
          action: "yourConnectionId",
          data: event.requestContext.connectionId,
          from: "server",
          roomId: "", // roomId is not needed for this message
        },
      });
      break;
    case "newOffer":
      await sendWebsocketMessage({
        message: message,
      });
      break;
    case "newAnswer":
      await sendWebsocketMessage({
        message: message,
      });
      break;
    case "newIceCandidate":
      await sendWebsocketMessage({
        message: message,
      });
      break;
    case "enterRoom":
      await enterRoom({
        myConnectionId: event.requestContext.connectionId,
        roomId: message.roomId,
      });
      break;
    default:
      throw new Error("unknown action in message");
  }
  return { statusCode: 200 };
}
