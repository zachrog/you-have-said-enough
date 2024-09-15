import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { sendWebsocketMessage } from "server/src/broadcastToRoom";
import { getRoomsByConnectionId } from "server/src/dynamo/getRoomsByConnectionId";
import { removeConnection } from "server/src/dynamo/removeConnection";
import { WebSocketReturn } from "server/src/socketApi";

export async function disconnectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("disconnect event: ", event);
  const rooms = await getRoomsByConnectionId({
    connectionId: event.requestContext.connectionId,
  });

  await Promise.all(
    rooms.map(async (room) => {
      await sendWebsocketMessage({
        message: {
          from: event.requestContext.connectionId,
          to: "all",
          roomId: room.roomId,
          data: "",
          action: "userDisconnected",
        },
      });
    })
  );

  await removeConnection(event.requestContext.connectionId);

  return { statusCode: 200 };
}
