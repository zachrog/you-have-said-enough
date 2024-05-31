import { getDynamo } from "./getDynamo";

export async function storeOffer({
  connectionId,
  offer,
}: {
  connectionId: string;
  offer: RTCSessionDescriptionInit;
}) {
  const dynamoDb = getDynamo();
  await dynamoDb.put({
    TableName: process.env.VITE_DBNAME,
    Item: {
      pk: "room|4206969",
      sk: `user|${connectionId}`,
      connectionId,
      offer,
    },
  });
}
