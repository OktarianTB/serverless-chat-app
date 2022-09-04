import { DynamoDB, ApiGatewayManagementApi } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

const WebsocketTableName = process.env.websocketTableName || "";
const MessageTableName = process.env.messageTableName || "";
const dynamoDb = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const messageData = JSON.parse(event.body || "").message;
  const messageSender = JSON.parse(event.body || "").sender;
  const messageId = uuidv4();

  const { stage, domainName } = event.requestContext;

  // Get all the connections
  const connections = await dynamoDb
    .scan({ TableName: WebsocketTableName, ProjectionExpression: "id" })
    .promise();

  const apiG = new ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`,
  });

  const postToConnection = async function ({ id }: { id: any }) {
    try {
      // Send the message to the given client
      await apiG
        .postToConnection({
          ConnectionId: id,
          Data: JSON.stringify({
            id: messageId,
            message: messageData,
            sentBy: messageSender.toLowerCase(),
            sentAt: new Date().getTime(),
          }),
        })
        .promise();
    } catch (e: any) {
      if (e.statusCode === 410) {
        // Remove stale connections
        await dynamoDb
          .delete({ TableName: WebsocketTableName, Key: { id } })
          .promise();
      }
    }
  };

  // Iterate through all the connections
  if (connections?.Items) {
    await Promise.all(connections.Items.map((id: any) => postToConnection(id)));
  }

  // Store the message in the database
  const params = {
    TableName: MessageTableName,
    Item: {
      id: messageId,
      message: messageData,
      sentBy: messageSender.toLowerCase(),
      sentAt: new Date().getTime(),
    },
  };

  await dynamoDb.put(params).promise();

  return { statusCode: 200, body: "Message sent" };
};
