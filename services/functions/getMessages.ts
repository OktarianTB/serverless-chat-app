import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const MessageTableName = process.env.messageTableName || "";

export async function handler() {
  const getParams = {
    TableName: MessageTableName,
    ScanIndexForward: false,
    Limit: 10,
  };
  const results = await dynamoDb.scan(getParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(results.Items),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": "application/json",
    },
  };
}
