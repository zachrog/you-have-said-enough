/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "you-have-said-enough",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    new sst.aws.StaticSite("Zuumb", {
      build: {
        commad:"npm run build",
        output:"dist"
      }
    });
  },
});
