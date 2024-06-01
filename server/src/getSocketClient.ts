import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";
import { environment } from "./environment";

let socketClient: ApiGatewayManagementApiClient;

export function getSocketClient() {
  if (!socketClient) {
    socketClient = new ApiGatewayManagementApiClient({
      endpoint: environment.webSocketUrl,
    });
  }
  return socketClient;
}
