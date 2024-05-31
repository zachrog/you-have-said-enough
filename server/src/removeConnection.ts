import { getDynamo } from "./getDynamo";

export async function removeConnection(connectionId: string) {
  const dynamoDb = getDynamo();
  await dynamoDb.delete({
    TableName: process.env.VITE_DBNAME,
    Key: { pk: "room|4206969", sk: `user|${connectionId}` },
  });
}
