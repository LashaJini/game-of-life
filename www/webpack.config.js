const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  devServer: {
    port: 3000,
  },
  mode: "development",
  plugins: [new CopyWebpackPlugin(["index.html"])],
};
