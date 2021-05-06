const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const outDir = "dist";
const PORT = 3000;

module.exports = {
  entry: "./src/index",
  // mode: "development",
  output: {
    path: path.join(__dirname, outDir),
    filename: "[name].bundle.js",
  },
  devServer: {
    contentBase: path.join(__dirname, outDir),
    port: PORT,
    compress: true,
  },
  devtool: "source-map",
  resolve: { extensions: ["*", ".js", ".jsx"] },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] },
      },
      {
        test: /\.css$/,
        use: [
          // MiniCssExtractPlugin.loader,
          "style-loader",
          "css-loader",
          // {
          //   loader: "postcss-loader",
          //   options: {
          //     postcssOptions: {
          //       plugins: [
          //         [
          //           "postcss-preset-env",
          //           {
          //             // Options
          //           },
          //         ],
          //       ],
          //     },
          //   },
          // },
        ],
      },
    ],
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: true,
      minifyJS: true,
      minifyCSS: true,
    }),
    // new MiniCssExtractPlugin({
    //   // Options similar to the same options in webpackOptions.output
    //   // both options are optional
    //   filename: "static/css/[name].[contenthash:8].css",
    //   chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
    // }),
    // new webpack.HotModuleReplacementPlugin(),
    // new ReactRefreshWebpackPlugin(),
  ],
};
