import { ConnectionRecord } from "server/src/storeConnection";
import { environment } from "./environment";
import { getDynamo } from "./getDynamo";

export async function getAllConnections(): Promise<
  Map<string, { connectionId: string }>
> {
  const dynamoDb = getDynamo();
  const dbName = environment.dynamoTableName;
  const result = await dynamoDb.query({
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

  const connectionMap: Map<string, { connectionId: string }> = new Map();
  (result.Items as ConnectionRecord[])?.forEach(
    (connection: ConnectionRecord) =>
      connectionMap.set(connection.data.connectionId, connection.data)
  );

  return connectionMap;
}
