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
    const socketApi = new sst.aws.ApiGatewayWebSocket("ZuumbWebSocketApi");

    socketApi.route("$connect", "server/src/socketApi.connectHandler");
    socketApi.route("$disconnect", "server/src/socketApi.disconnectHandler");
    socketApi.route("$default", "server/src/socketApi.defaultHandler");

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
    new sst.aws.Dynamo("Zuumbdb", {
      fields: {
        pk: "string",
        sk: "string",
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
    });

    const httpApi = new sst.aws.ApiGatewayV2("ZuumbApi");
    httpApi.route("ANY /{proxy+}", "server/src/httpApi.api");
  },
});
