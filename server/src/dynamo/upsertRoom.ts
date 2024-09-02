import { expireIn3Days } from "server/src/dynamo/dynamoTypes";
import { getDynamo } from "server/src/dynamo/getDynamo";
import { RoomRecord } from "server/src/dynamo/getRoom";
import { Room } from 'server/src/entities/Room';
import { environment } from "server/src/environment";

export async function upsertRoom({ room }: { room: Room }): Promise<void> {
  const dynamo = getDynamo();

  const record: RoomRecord = {
    pk: `room|${room.roomId}`,
    sk: `room|${room.roomId}`,
    data: room,
    ttl: expireIn3Days(),
  };

  await dynamo.put({
    TableName: environment.dynamoTableName,
    Item: record,
  });
}
