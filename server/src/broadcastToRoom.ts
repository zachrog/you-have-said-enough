import { getDynamo } from "./getDynamo";
import { environment } from "./environment";
import { getSocketClient } from "./getSocketClient";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { ClientWebsocketMessage } from "../../ui/src/WebSocket";

export async function broadcastToRoom({
  myConnectionId,
  message,
}: {
  myConnectionId: string;
  message: ClientWebsocketMessage;
}) {
  const dynamoDb = getDynamo();
  const dbName = environment.dynamoTableName;

  const userRecords = await dynamoDb.query({
    TableName: dbName,
    ExpressionAttributeNames: {
      "#pk": "pk",
      "#sk": "sk",
    },
    ExpressionAttributeValues: {
      ":pk": "room|4206969",
      ":sk": "user|",
    },
    KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
  });

  const connectionIds: Set<string> = new Set();
  userRecords.Items?.forEach((item) => {
    connectionIds.add(item.connectionId);
  });
  connectionIds.delete(myConnectionId);

  const socketClient = getSocketClient();

  await Promise.all(
    Array.from(connectionIds).map(async (connectionId) => {
      await socketClient.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: JSON.stringify(message),
        })
      );
    })
  );
}
