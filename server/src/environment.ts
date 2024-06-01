import { PointInTimeRecoveryStatus } from "@aws-sdk/client-dynamodb";

export const environment = {
  dynamoTableName: process.env.VITE_DBNAME || "",
  webSocketUrl: process.env.VITE_WEBSOCKET_URL || "",
};
