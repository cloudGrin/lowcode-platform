// production config
const { merge } = require('webpack-merge')
const { resolve } = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
var webpack = require('webpack')

const commonConfig = require('./common')

module.exports = merge(commonConfig, {
  mode: 'production',
  output: {
    filename: 'js/[name].[contenthash].bundle.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: '/'
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        PUBLIC_STRAPI_API_URL: "'/strapi'"
      }
    })
  ]
})
