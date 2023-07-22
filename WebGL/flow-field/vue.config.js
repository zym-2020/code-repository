const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "./",
  outputDir: process.env.outputDir,
  chainWebpack: (config) => {
    config.module
      .rule("worker-loader")
      .test(/\.worker\.js$/)
      .use({
        loader: "worker-loader",
        options: {
          inline: true,
        },
      })
      .loader("worker-loader")
      .end();
  },
});
