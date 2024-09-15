import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { sendWebsocketMessage } from "server/src/broadcastToRoom";
import { deleteRoom } from "server/src/dynamo/deleteRoom";
import { getAllConnections } from "server/src/dynamo/getAllConnections";
import { getRoomsByConnectionId } from "server/src/dynamo/getRoomsByConnectionId";
import { removeConnection } from "server/src/dynamo/removeConnection";
import { WebSocketReturn } from "server/src/socketApi";

export async function disconnectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("disconnect event: ", event);
  const myConnectionId = event.requestContext.connectionId;
  const rooms = await getRoomsByConnectionId({
    connectionId: myConnectionId,
  });

  await Promise.all(
    rooms.map(async (room) => {
      await sendWebsocketMessage({
        message: {
          from: myConnectionId,
          to: "all",
          roomId: room.roomId,
          data: "",
          action: "userDisconnected",
        },
      });
    })
  );

  await Promise.all(
    rooms.map(async (room) => {
      await removeConnection({
        connectionId: myConnectionId,
        roomId: room.roomId,
      });
    })
  );

  await Promise.all(
    rooms.map(async (room) => {
      const connections = await getAllConnections(room.roomId);
      if (connections.size === 0) {
        console.log("deleting room: ", room.roomId);
        await deleteRoom(room.roomId);
      }
    })
  );

  return { statusCode: 200 };
}
