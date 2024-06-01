import { environment } from "./environment";
import { getDynamo } from "./getDynamo";
import { broadcastToRoom } from "./broadcastToRoom";

export async function storeOffer({
  connectionId,
  offer,
}: {
  connectionId: string;
  offer: RTCSessionDescriptionInit;
}) {
  const dynamoDb = getDynamo();
  const dbName = environment.dynamoTableName;
  await dynamoDb.put({
    TableName: dbName,
    Item: {
      pk: "room|4206969",
      sk: `user|${connectionId}`,
      connectionId,
      offer,
    },
  });
}
