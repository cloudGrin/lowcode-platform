// production config
const { merge } = require("webpack-merge");
const { resolve } = require("path");

const commonConfig = require("./common");

module.exports = merge(commonConfig, {
  mode: "production",
  output: {
    filename: "js/[name].[contenthash].bundle.js",
    path: resolve(__dirname, "../../dist"),
    publicPath: "/",
    clean: true, // 在生成文件之前清空 output 目录
  },
  devtool: "source-map",
});
