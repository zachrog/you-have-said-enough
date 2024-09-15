import { environment } from "../environment";
import { getDynamo } from "./getDynamo";
import { getRoomsByConnectionId } from "server/src/dynamo/getRoomsByConnectionId";

export async function removeConnection(connectionId: string): Promise<void> {
  const dynamoDb = getDynamo();
  const connectionRecords = await getRoomsByConnectionId({ connectionId });

  const promises = connectionRecords.map(async (connectionRecord) => {
    await dynamoDb.delete({
      TableName: environment.dynamoTableName,
      Key: {
        pk: `room|${connectionRecord.roomId}`,
        sk: `user|${connectionId}`,
      },
    });
  });

  await Promise.all(promises);
}
