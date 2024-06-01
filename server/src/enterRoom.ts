import { ClientWebsocketMessage } from "@/socketClient";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { getAllConnections } from "./getAllConnections";
import { getSocketClient } from "./getSocketClient";

export async function enterRoom({ connectionId }: { connectionId: string }) {
  const connectionIds = await getAllConnections();
  connectionIds.delete(connectionId);

  const socketClient = getSocketClient();

  const connectIdMessage: ClientWebsocketMessage = {
    action: "yourConnectionId",
    from: "server",
    to: connectionId,
    data: connectionId,
  };
  await socketClient.send(
    new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(connectIdMessage),
    })
  );

  const allIdsMessage: ClientWebsocketMessage = {
    action: "allConnectionIds",
    from: "server",
    to: connectionId,
    data: Array.from(connectionIds),
  };
  await socketClient.send(
    new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(allIdsMessage),
    })
  );
}
