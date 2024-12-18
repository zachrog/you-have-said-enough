import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { sendWebsocketMessage } from "./broadcastToRoom";
import { enterRoom } from "./enterRoom";
import { updateRoom } from "server/src/updateRoom";

export type WebSocketReturn = {
  statusCode: number;
};

export type ServerWebsocketMessage = {
  action:
    | "newOffer"
    | "newAnswer"
    | "newIceCandidate"
    | "enterRoom"
    | "yourConnectionId"
    | "updateRoom";
  to: string;
  from: string;
  data: any;
  roomId: string;
};

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
    case "updateRoom":
      await updateRoom({
        audioWindow: message.data.audioWindow,
        roomId: message.roomId,
        myConnectionId: event.requestContext.connectionId,
      });
      break;
    default:
      throw new Error("unknown action in message");
  }
  return { statusCode: 200 };
}
