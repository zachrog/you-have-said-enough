import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

type WebSocketReturn = {
  statusCode: number;
  body?: string;
};

export async function connectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("connect event: ", event);
  return { statusCode: 200, body: "hola" };
}

export async function disconnectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("disconnect event: ", event);
  return { statusCode: 200, body: "hola" };
}

export async function defaultHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("default event: ", event);
  return { statusCode: 200, body: "hola" };
}
