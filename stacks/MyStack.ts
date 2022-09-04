import { StackContext, Table, WebSocketApi, Api, ReactStaticSite } from "@serverless-stack/resources";

export function MyStack({ stack }: StackContext) {
  // Create the table
  const websocketTable = new Table(stack, "Connections", {
    fields: {
      id: "string",
    },
    primaryIndex: { partitionKey: "id" },
  });

  // Create the table
  const messageTable = new Table(stack, "Messages", {
    fields: {
      id: "string",
      message: "string",
      sentBy: "string",
      sentAt: "number",
    },
    primaryIndex: { partitionKey: "id" },
  });

  // Create the WebSocket API
  const websocketApi = new WebSocketApi(stack, "WebSocketApi", {
    defaults: {
      function: {
        permissions: [websocketTable, messageTable],
        environment: {
          websocketTableName: websocketTable.tableName,
          messageTableName: messageTable.tableName,
        },
      },
    },
    routes: {
      $connect: "functions/connect.handler",
      $disconnect: "functions/disconnect.handler",
      sendmessage: "functions/sendMessage.handler",
    },
  });

  // Create the Message API
  const messageApi = new Api(stack, 'MessageApi', {
    defaults: {
      function: {
        permissions: [messageTable],
        environment: {
          messageTableName: messageTable.tableName,
        },
      },
    },
    routes: {
      'GET /messages': 'functions/getMessages.handler',
    },
  });

    // Deploy our React app
  const site = new ReactStaticSite(stack, 'ReactSite', {
    path: 'frontend',
    environment: {
      REACT_APP_WEBSOCKET_API_URL: websocketApi.url,
      REACT_APP_MESSAGE_API_URL: messageApi.url,
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    WebSocketApiEndpoint: websocketApi.url,
    MessageApiEndpoint: messageApi.url,
    SiteUrl: site.url,
  });
}
