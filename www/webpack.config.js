const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

const outDir = "dist";
const PORT = 3000;

module.exports = function (webpackEnv) {
  const isProd = webpackEnv === "production";
  const isDev = webpackEnv === "development";

  return {
    entry: "./src/index",
    output: {
      path: path.join(__dirname, outDir),
      filename: isProd ? "[name].[contenthash:8].js" : "[name].bundle.js",
      chunkFilename: isProd
        ? "[name].[contenthash:8].chunk.js"
        : "[name].chunk.js",
      // filename: "[name].[contenthash].js",
    },
    devServer: {
      contentBase: path.join(__dirname, outDir),
      port: PORT,
      compress: true,
      hot: true,
    },
    devtool: isDev ? "source-map" : false,
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
            MiniCssExtractPlugin.loader,
            // "style-loader",
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
      new MiniCssExtractPlugin({
        // filename: "static/css/[name].[contenthash:8].css",
        // chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
      }),
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin(),
      new ESLintPlugin(),
    ],
  };
};
