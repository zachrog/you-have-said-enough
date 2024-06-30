import { TDynamoRecord, expireIn3Days } from "server/src/dynamoTypes";
import { environment } from "./environment";
import { getDynamo } from "./getDynamo";

export async function storeConnection(connectionId: string): Promise<void> {
  const dynamoDb = getDynamo();
  const ttl = expireIn3Days();
  const connectionRecord: ConnectionRecord = {
    pk: "room|4206969",
    sk: `user|${connectionId}`,
    ttl,
    data: { connectionId },
  };

  await dynamoDb.put({
    TableName: environment.dynamoTableName,
    Item: connectionRecord,
  });
}

export type ConnectionRecord = TDynamoRecord<{ connectionId: string }>;
