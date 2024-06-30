// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      providers: { aws: true },
      name: "you-have-said-enough",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const dynamoDb = new sst.aws.Dynamo("Zuumbdb", {
      fields: {
        pk: "string",
        sk: "string",
      },
      ttl: "ttl",
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
    });
    const dbName = dynamoDb.name;

    const socketApi = new sst.aws.ApiGatewayWebSocket("ZuumbWebSocketApi");

    socketApi.route("$connect", {
      handler: "server/src/connectHandler.connectHandler",
      environment: {
        VITE_DBNAME: dbName,
        VITE_WEBSOCKET_URL: socketApi.url,
      },
      permissions: [
        { actions: ["dynamodb:*"], resources: ["*"] },
        { actions: ["execute-api:*"], resources: ["*"] },
      ],
    });
    socketApi.route("$disconnect", {
      handler: "server/src/socketApi.disconnectHandler",
      environment: {
        VITE_DBNAME: dbName,
        VITE_WEBSOCKET_URL: socketApi.url,
      },
      permissions: [
        { actions: ["dynamodb:*"], resources: ["*"] },
        { actions: ["execute-api:*"], resources: ["*"] },
      ],
    });
    socketApi.route("$default", {
      handler: "server/src/socketApi.defaultHandler",
      environment: {
        VITE_DBNAME: dbName,
        VITE_WEBSOCKET_URL: socketApi.url,
      },
      permissions: [
        { actions: ["dynamodb:*"], resources: ["*"] },
        { actions: ["execute-api:*"], resources: ["*"] },
      ],
    });

    new sst.aws.StaticSite("Zuumb", {
      build: {
        command: "npm run build",
        output: "ui/dist",
      },
      domain: {
        name: "zuumb.com",
        redirects: ["www.zuumb.com"],
      },
      environment: {
        VITE_WEBSOCKET_URL: socketApi.url,
      },
    });

    const httpApi = new sst.aws.ApiGatewayV2("ZuumbApi");
    httpApi.route("ANY /{proxy+}", "server/src/httpApi.api");
  },
});
