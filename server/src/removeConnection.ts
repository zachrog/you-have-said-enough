import { environment } from "./environment";
import { getDynamo } from "./getDynamo";

export async function removeConnection(connectionId: string) {
  const dynamoDb = getDynamo();
  await dynamoDb.delete({
    TableName: environment.dynamoTableName,
    Key: { pk: "room|4206969", sk: `user|${connectionId}` },
  });
}
