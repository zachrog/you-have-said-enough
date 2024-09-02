import { expireIn3Days } from "server/src/dynamo/dynamoTypes";
import { getDynamo } from "server/src/dynamo/getDynamo";
import { Room, RoomRecord } from "server/src/dynamo/getRoom";
import { environment } from "server/src/environment";

export async function upsertRoom({
  roomId,
  room,
}: {
  roomId: string;
  room: Room;
}): Promise<void> {
  const dynamo = getDynamo();

  const record: RoomRecord = {
    pk: `room|${roomId}`,
    sk: `room|${roomId}`,
    data: room,
    ttl: expireIn3Days(),
  };

  await dynamo.put({
    TableName: environment.dynamoTableName,
    Item: record,
  });
}
