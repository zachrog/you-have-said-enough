import { getDynamo } from "./getDynamo";

export async function storeConnection(connectionId: string) {
  const dynamoDb = getDynamo();
  await dynamoDb.put({
    TableName: process.env.VITE_DBNAME,
    Item: { pk: "daisy", sk: "daisy", connectionId },
  });
}
