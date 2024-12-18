import { TDynamoRecord } from "server/src/dynamo/dynamoTypes";
import { getDynamo } from "server/src/dynamo/getDynamo";
import { Room } from "server/src/entities/Room";
import { environment } from "server/src/environment";

export async function getRoom({
  roomId,
}: {
  roomId: string;
}): Promise<Room | undefined> {
  const dynamo = getDynamo();

  const result = await dynamo.get({
    TableName: environment.dynamoTableName,
    Key: { pk: `room|${roomId}`, sk: `room|${roomId}` },
  });

  return (result?.Item as RoomRecord)?.data;
}

export type RoomRecord = TDynamoRecord<Room>;
