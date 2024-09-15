import { getSocketClient } from "./getSocketClient";
import {
  GoneException,
  PostToConnectionCommand,
  PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { ClientWebsocketMessage } from "../../ui/src/socketClient";
import { getAllConnections } from "./dynamo/getAllConnections";

export async function sendWebsocketMessage({
  message,
}: {
  message: ClientWebsocketMessage;
}) {
  if (message.to === "all") {
    await broadcastToRoom({
      myConnectionId: message.from,
      message: message,
    });
  } else {
    await apiGatewaySendMessage({
      ConnectionId: message.to,
      Data: JSON.stringify(message),
    });
  }
}

async function broadcastToRoom({
  myConnectionId,
  message,
}: {
  myConnectionId: string;
  message: ClientWebsocketMessage;
}) {
  const connectionIds = await getAllConnections(message.roomId);
  connectionIds.delete(myConnectionId);

  await Promise.all(
    Array.from(connectionIds.values()).map(async (connection) => {
      await apiGatewaySendMessage({
        ConnectionId: connection.connectionId,
        Data: JSON.stringify(message),
      });
    })
  );
}

async function apiGatewaySendMessage(
  command: PostToConnectionCommandInput
): Promise<void> {
  try {
    await getSocketClient().send(new PostToConnectionCommand(command));
  } catch (e) {
    if (e instanceof GoneException) {
      console.log(
        "connection no longer exists, so cannot send message: ",
        command.ConnectionId
      );
      return;
    }
    throw e;
  }
}
