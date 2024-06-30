import { getSocketClient } from "./getSocketClient";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { ClientWebsocketMessage } from "../../ui/src/socketClient";
import { getAllConnections } from "./getAllConnections";

export async function sendWebsocketMessage({
  message,
}: {
  message: ClientWebsocketMessage;
}) {
  if (message.to == "all") {
    await broadcastToRoom({
      myConnectionId: message.from,
      message: message,
    });
  } else {
    await getSocketClient().send(
      new PostToConnectionCommand({
        ConnectionId: message.to,
        Data: JSON.stringify(message),
      })
    );
  }
}

async function broadcastToRoom({
  myConnectionId,
  message,
}: {
  myConnectionId: string;
  message: ClientWebsocketMessage;
}) {
  const connectionIds = await getAllConnections();
  connectionIds.delete(myConnectionId);

  const socketClient = getSocketClient();

  await Promise.all(
    Array.from(connectionIds.values()).map(async (connection) => {
      await socketClient.send(
        new PostToConnectionCommand({
          ConnectionId: connection.connectionId,
          Data: JSON.stringify(message),
        })
      );
    })
  );
}
