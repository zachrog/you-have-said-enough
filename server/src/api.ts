import { APIGatewayProxyResultV2 } from "aws-lambda";

export async function api(): Promise<APIGatewayProxyResultV2> {
  return {
    body: "Welcome to Zuumba",
    statusCode: 200,
  };
}
