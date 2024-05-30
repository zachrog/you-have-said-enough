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
    new sst.aws.StaticSite("Zuumb", {
      build: {
        command: "npm run build",
        output: "dist",
      },
    });
  },
});
