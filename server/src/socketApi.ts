import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { storeConnection } from "./storeConnection";
import { removeConnection } from "./removeConnection";

type WebSocketReturn = {
  statusCode: number;
  body?: string;
};

export async function connectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("connect event: ", event);
  await storeConnection(event.requestContext.connectionId);
  return { statusCode: 200, body: "storing connection id" };
}

export async function disconnectHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("disconnect event: ", event);
  await removeConnection(event.requestContext.connectionId);
  return { statusCode: 200, body: "hola" };
}

export async function defaultHandler(
  event: APIGatewayProxyWebsocketEventV2
): Promise<WebSocketReturn> {
  console.log("default event: ", event);

  return { statusCode: 200, body: "hola" };
}
