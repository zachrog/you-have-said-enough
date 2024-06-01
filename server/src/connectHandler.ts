import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { storeConnection } from "./storeConnection";
import { WebSocketReturn } from "./socketApi";

export async function connectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("connect event: ", event);
  const myConnectionId = event.requestContext.connectionId;
  await storeConnection(myConnectionId);
  return { statusCode: 200 };
}
