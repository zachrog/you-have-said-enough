import { environment } from "../environment";
import { getDynamo } from "./getDynamo";

export async function removeConnection({
  roomId,
  connectionId,
}: {
  roomId: string;
  connectionId: string;
}): Promise<void> {
  const dynamoDb = getDynamo();

  await dynamoDb.delete({
    TableName: environment.dynamoTableName,
    Key: {
      pk: `room|${roomId}`,
      sk: `user|${connectionId}`,
    },
  });
}
