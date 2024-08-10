import { ConnectionRecord } from "server/src/storeConnection";
import { environment } from "./environment";
import { getDynamo } from "./getDynamo";

export async function removeConnection(connectionId: string): Promise<void> {
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

  const connectionRecords: ConnectionRecord[] = (result.Items as any) || [];

  const promises = connectionRecords.map(
    async (connectionRecord: ConnectionRecord) => {
      await dynamoDb.delete({
        TableName: environment.dynamoTableName,
        Key: {
          pk: `room|${connectionRecord.data.roomId}`,
          sk: `user|${connectionRecord.data.connectionId}`,
        },
      });
    }
  );

  await Promise.all(promises);
}
