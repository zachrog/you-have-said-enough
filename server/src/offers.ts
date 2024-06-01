import { environment } from "./environment";
import { getDynamo } from "./getDynamo";
import { getSocketClient } from "./getSocketClient";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export async function storeOffer({
  connectionId,
  offer,
}: {
  connectionId: string;
  offer: RTCSessionDescriptionInit;
}) {
  const dynamoDb = getDynamo();
  const dbName = environment.dynamoTableName;
  await dynamoDb.put({
    TableName: dbName,
    Item: {
      pk: "room|4206969",
      sk: `user|${connectionId}`,
      connectionId,
      offer,
    },
  });

  const userRecords = await dynamoDb.query({
    TableName: dbName,
    ExpressionAttributeNames: {
      "#pk": "pk",
      "#sk": "sk",
    },
    ExpressionAttributeValues: {
      ":pk": "room|4206969",
      ":sk": "user|",
    },
    KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
  });

  const connectionIds =
    userRecords.Items?.map((item) => {
      return item.connectionId;
    }) || [];

  console.log("Getting socket client");
  const socketClient = getSocketClient();
  console.log("Got socket client");
  for (let index = 0; index < connectionIds.length; index++) {
    const iD = connectionIds[index];
    console.log("sending message");
    await socketClient.send(
      new PostToConnectionCommand({
        ConnectionId: iD,
        Data: JSON.stringify(offer),
      })
    );
    console.log("sent offer");
  }
}
