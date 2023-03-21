const { resolve } = require("path");
module.exports = {
  publicPath: "./",
  devServer: {
    host: "0.0.0.0",
    port: 8083,
    proxy: {
      "/SSE": {
        target: "http://localhost:8005/",
        changeOrigin: true,
        pathRewrite: {
          "^/SSE": "",
        },
      },
    },
  },

  configureWebpack: {
    resolve: {
      alias: {
        "@": resolve("src"),
      },
    },
  },
};
