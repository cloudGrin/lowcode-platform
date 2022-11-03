// development config
const { join } = require('path')
const { merge } = require('webpack-merge')
const commonConfig = require('./common')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

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
      '/pagePreview': {
        target: `http://localhost:${webPort}`,
        secure: false,
        pathRewrite: { '^/pagePreview': '/preview.html' }
      }
    },
    // static: {
    //   directory: join(__dirname, '../../src/public')
    // },
    hot: true, // enable HMR on the server
    historyApiFallback: true // fixes error 404-ish errors when using react router :see this SO question: https://stackoverflow.com/questions/43209666/react-router-v4-cannot-get-url
  },
  devtool: 'cheap-module-source-map',
  plugins: [new ReactRefreshPlugin()]
})
