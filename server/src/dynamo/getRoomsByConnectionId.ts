import { getDynamo } from "server/src/dynamo/getDynamo";
import { ConnectionRecord } from "server/src/dynamo/storeConnection";
import { environment } from "server/src/environment";

export async function getRoomsByConnectionId({
  connectionId,
}: {
  connectionId: string;
}): Promise<{ roomId: string }[]> {
  const dynamoDb = getDynamo();
  const result = await dynamoDb.query({
    TableName: environment.dynamoTableName,
    ExpressionAttributeNames: {
      "#pk2": "pk2",
      "#sk2": "sk2",
    },
    ExpressionAttributeValues: {
      ":pk2": `user|${connectionId}`,
      ":sk2": "room|",
    },
    IndexName: "gsi2",
    KeyConditionExpression: "#pk2 = :pk2 and begins_with(#sk2, :sk2)",
  });

  const connectionRecords: ConnectionRecord[] =
    (result.Items as unknown as ConnectionRecord[]) || [];
  return connectionRecords.map((connectionRecord) => ({
    roomId: connectionRecord.data.roomId,
  }));
}
