const cesiumSource = "./node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";
const CopyWebpackPlugin = require("copy-webpack-plugin");

const path = require("path");
const webpack = require("webpack");

const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: { https: false, zlib: false, http: false, url: false },
      mainFiles: ["index", "Cesium"],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" },
          { from: path.join(cesiumSource, "Assets"), to: "Assets" },
          { from: path.join(cesiumSource, "Widgets"), to: "Widgets" },
          { from: path.join(cesiumSource, "ThirdParty"), to: "ThirdParty" },
        ],
      }),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("./"),
      }),
    ],
  },
});
