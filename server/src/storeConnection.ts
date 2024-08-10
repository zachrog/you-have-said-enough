import { TDynamoRecord, expireIn3Days } from "server/src/dynamoTypes";
import { environment } from "./environment";
import { getDynamo } from "./getDynamo";

export async function storeConnection(
  connectionId: string,
  roomId: string
): Promise<void> {
  const dynamoDb = getDynamo();
  const ttl = expireIn3Days();
  const connectionRecord: ConnectionRecord = {
    pk: `room|${roomId}`,
    sk: `user|${connectionId}`,
    pk2: `user|${connectionId}`,
    sk2: `room|${roomId}`,
    ttl,
    data: { connectionId, roomId },
  };

  await dynamoDb.put({
    TableName: environment.dynamoTableName,
    Item: connectionRecord,
  });
}

export type ConnectionRecord = TDynamoRecord<{
  connectionId: string;
  roomId: string;
}>;
