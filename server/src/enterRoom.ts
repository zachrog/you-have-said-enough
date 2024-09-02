import { DEFAULT_AUDIO_WINDOW } from "@/lib/audioStatistics";
import { sendWebsocketMessage } from "server/src/broadcastToRoom";
import { getRoom } from "server/src/dynamo/getRoom";
import { storeConnection } from "server/src/dynamo/storeConnection";
import { upsertRoom } from "server/src/dynamo/upsertRoom";

export async function enterRoom({
  myConnectionId,
  roomId,
}: {
  myConnectionId: string;
  roomId: string;
}) {
  await Promise.all([
    await storeConnection(myConnectionId, roomId),
    async () => {
      await sendWebsocketMessage({
        message: {
          action: "newUserJoined",
          from: myConnectionId,
          to: "all",
          data: myConnectionId,
          roomId: roomId,
        },
      });
    },
    async () => {
      let room = await getRoom({ roomId });
      if (!room) {
        room = { audioWindow: DEFAULT_AUDIO_WINDOW, roomId: roomId };
        await upsertRoom({
          room,
        });
      }

      await sendWebsocketMessage({
        message: {
          action: "roomInfo",
          data: room,
          from: myConnectionId,
          roomId,
          to: myConnectionId,
        },
      });
    },
  ]);
}
