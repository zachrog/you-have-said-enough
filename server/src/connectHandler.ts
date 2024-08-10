import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { WebSocketReturn } from "./socketApi";

export async function connectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("connect event: ", event);
  return { statusCode: 200 };
}
