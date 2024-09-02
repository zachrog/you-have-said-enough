import { ClientWebsocketMessage } from "@/socketClient";
import { sendWebsocketMessage } from "server/src/broadcastToRoom";
import { storeConnection } from "server/src/dynamo/storeConnection";

export async function enterRoom({
  myConnectionId,
  roomId,
}: {
  myConnectionId: string;
  roomId: string;
}) {
  await storeConnection(myConnectionId, roomId);

  const newUserConnectedMessage: ClientWebsocketMessage = {
    action: "newUserJoined",
    from: myConnectionId,
    to: "all",
    data: myConnectionId,
    roomId: roomId,
  };

  await sendWebsocketMessage({ message: newUserConnectedMessage });
}
