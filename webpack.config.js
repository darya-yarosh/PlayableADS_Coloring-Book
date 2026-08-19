const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: "bundle.min.js",
    path: path.resolve(__dirname, 'dist/'),
    clean: true,
    publicPath: "",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      },
      {
        test: /\.(gif|png|jpe?g|svg|mp3|m4a|ogg|wav|json|ttf|woff2$)$/i,
        type: 'asset/inline'
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      inject: 'body'
    }),
    new HtmlInlineScriptPlugin()
  ],
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  }
};