import { environment } from "./environment";
import { getDynamo } from "./getDynamo";

export async function storeConnection(connectionId: string) {
  const dynamoDb = getDynamo();
  await dynamoDb.put({
    TableName: environment.dynamoTableName,
    Item: { pk: "room|4206969", sk: `user|${connectionId}`, connectionId },
  });
}
