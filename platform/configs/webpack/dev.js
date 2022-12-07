// development config
const { merge } = require('webpack-merge')
const commonConfig = require('./common')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')
const dotenv = require('dotenv')
dotenv.config()

console.log('__dirname', __dirname)

const webPort = process.env.DEV_SERVER_PORT || 8000

module.exports = merge(commonConfig, {
  mode: 'development',
  output: {
    publicPath: '/'
  },
  devServer: {
    port: webPort,
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    },
    proxy: {
      '/pageDesigner': {
        target: `http://localhost:${webPort}`,
        secure: false,
        pathRewrite: { '^/pageDesigner': '/designer.html' }
      },
      '/app/*': {
        target: `http://localhost:${webPort}`,
        secure: false,
        pathRewrite: { '^/app/?[^?]*': '/preview.html' }
      },
      '/strapi': {
        target: 'http://localhost:1337',
        secure: false,
        pathRewrite: { '^/strapi': '' }
      }
    },
    // static: {
    //   directory: join(__dirname, '../../src/public')
    // },
    hot: true, // enable HMR on the server
    historyApiFallback: true // fixes error 404-ish errors when using react router :see this SO question: https://stackoverflow.com/questions/43209666/react-router-v4-cannot-get-url
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new ReactRefreshPlugin(),
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
})
