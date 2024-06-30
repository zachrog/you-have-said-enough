import { ClientWebsocketMessage } from "@/socketClient";
import { sendWebsocketMessage } from "server/src/broadcastToRoom";

export async function enterRoom({
  myConnectionId,
}: {
  myConnectionId: string;
}) {
  const newUserConnectedMessage: ClientWebsocketMessage = {
    action: "newUserJoined",
    from: myConnectionId,
    to: "all",
    data: myConnectionId,
  };

  await sendWebsocketMessage({ message: newUserConnectedMessage });
}
