import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

let dynamoDb: DynamoDBDocument;

export function getDynamo() {
  if (!dynamoDb) {
    const tempDbClient = new DynamoDBClient({
      maxAttempts: 5,
    });
    dynamoDb = DynamoDBDocument.from(tempDbClient);
  }
  return dynamoDb;
}
