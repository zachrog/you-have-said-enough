import { environment } from "./environment";
import { getDynamo } from "./getDynamo";

export async function getAllConnections(): Promise<Set<string>> {
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
  return connectionIds;
}
