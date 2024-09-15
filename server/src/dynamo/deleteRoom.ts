import { getDynamo } from "server/src/dynamo/getDynamo";
import { environment } from "server/src/environment";

export async function deleteRoom(roomId: string): Promise<void> {
  const dynamoDb = getDynamo();
  const dbName = environment.dynamoTableName;
  const result = await dynamoDb.query({
    TableName: dbName,
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    ExpressionAttributeValues: {
      ":pk": `room|${roomId}`,
    },
    KeyConditionExpression: "#pk = :pk",
  });

  const deleteRequests = (result.Items || []).map((item) => ({
    DeleteRequest: {
      Key: {
        pk: item.pk,
        sk: item.sk,
      },
    },
  }));

  await dynamoDb.batchWrite({ // This only works for up to 25 items
    RequestItems: {
      [dbName]: deleteRequests,
    },
  });
}
