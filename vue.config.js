/*
 * @Author: your name
 * @Date: 2021-02-01 14:56:05
 * @LastEditTime: 2021-03-02 17:41:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\vue.config.js
 */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

let cesiumSource = "./node_modules/cesium/Source";
let cesiumWorkers = "../Build/Cesium/Workers";

module.exports = {
  // 基本路径
  publicPath: "./",
  // publicPath:"./",
  // 输出文件目录
  outputDir: "dist",
  assetsDir: "static", // 打包后的静态文件位置，
  // eslint-loader 是否在保存的时候检查
  lintOnSave: false,
  // webpack-dev-server 相关配置
  devServer: {
    open: process.platform === "darwin",
    host: "0.0.0.0",
    port: 5000,
    https: false,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    hotOnly: false,
    disableHostCheck: true
  },
  configureWebpack: {
    output: {
      sourcePrefix: " "
    },
    amd: {
      toUrlUndefined: true
    },
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
        "@": path.resolve("src"),
        cesium: path.resolve(__dirname, cesiumSource)
      }
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" }
      ]),
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, "Assets"), to: "Assets" }
      ]),
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, "Widgets"), to: "Widgets" }
      ]),
      new CopyWebpackPlugin([
        {
          from: path.join(cesiumSource, "ThirdParty/Workers"),
          to: "ThirdParty/Workers"
        }
      ]),
      new CopyWebpackPlugin([
        {
          from: path.join(cesiumSource, cesiumWorkers),
          to: "resources/Workers"
        }
      ]),
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, "Assets"), to: "resources/Assets" }
      ]),
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, "Widgets"), to: "resources/Widgets" }
      ]),
      new CopyWebpackPlugin([
        {
          from: path.join(cesiumSource, "ThirdParty/Workers"),
          to: "resources/ThirdParty/Workers"
        }
      ]),
      new CopyWebpackPlugin([
        {
          from: "./node_modules/three/examples/js/libs/draco/gltf",
          to: "libs/draco/gltf/"
        }
      ]),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("./")
      })
    ],
    module: {
      // unknownContextCritical: /^.\/.*$/,
      unknownContextCritical: false,
      rules: [
        {
          test: /\.glsl$/,
          loader: "webpack-glsl-loader"
        }
      ]
    }
  }
};
