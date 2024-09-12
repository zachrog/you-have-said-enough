import { sendWebsocketMessage } from "server/src/broadcastToRoom";
import { upsertRoom } from "server/src/dynamo/upsertRoom";
import { Room } from "server/src/entities/Room";

export async function updateRoom({
  audioWindow,
  roomId,
  myConnectionId,
}: {
  audioWindow: number;
  roomId: string;
  myConnectionId: string;
}) {
  const newRoom: Room = { audioWindow, roomId };
  await upsertRoom({
    room: newRoom,
  });

  await sendWebsocketMessage({
    message: {
      action: "roomInfo",
      data: newRoom,
      from: myConnectionId,
      roomId,
      to: "all",
    },
  });
}
