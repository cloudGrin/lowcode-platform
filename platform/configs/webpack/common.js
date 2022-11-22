// shared config (dev and prod)
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const isProductionMode = process.env.NODE_ENV === 'production'
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  // infrastructureLogging: {
  //   debug: true
  // },
  entry: {
    platform: './src/platform.tsx',
    designer: './src/designer.tsx',
    preview: './src/preview.tsx'
  },
  stats: 'errors-only',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': resolve(__dirname, '../../src')
    }
  },
  context: resolve(__dirname, '../../'),
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        include: /node_modules/,
        test: /\.mjs$/,
        type: 'javascript/auto'
      },
      {
        test: [/\.jsx?$/, /\.tsx?$/],
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              import: true
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      },
      {
        test: /\.(scss|sass)$/,
        include: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              import: true
            }
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              import: true
            }
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'less-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: [
          'file-loader?hash=sha512&digest=hex&name=img/[contenthash].[ext]',
          'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false'
        ]
      },
      {
        test: /\.svg$/,
        use: [
          { loader: 'svg-sprite-loader', options: {} },
          { loader: 'svgo-loader', options: {} }
        ]
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      chunks: ['platform'],
      filename: 'index.html',
      title: 'platform',
      templateParameters: {
        useFor: 'platform'
      }
    }),
    new HtmlWebpackPlugin({
      chunks: ['designer'],
      filename: 'designer.html',
      title: 'designer',
      templateParameters: {
        useFor: 'designer'
      }
    }),
    new HtmlWebpackPlugin({
      chunks: ['preview'],
      filename: 'preview.html',
      title: 'preview',
      templateParameters: {
        useFor: 'preview'
      }
    }),
    new MiniCssExtractPlugin({
      filename: isProductionMode ? '[name].[contenthash].css' : '[name].css'
    })
  ],
  externals: {
    react: 'var window.React',
    'react-dom': 'var window.ReactDOM',
    'prop-types': 'var window.PropTypes',
    '@alifd/next': 'var window.Next',
    '@alilc/lowcode-engine': 'var window.AliLowCodeEngine',
    '@alilc/lowcode-editor-core': 'var window.AliLowCodeEngine.common.editorCabin',
    '@alilc/lowcode-editor-skeleton': 'var window.AliLowCodeEngine.common.skeletonCabin',
    '@alilc/lowcode-designer': 'var window.AliLowCodeEngine.common.designerCabin',
    '@alilc/lowcode-engine-ext': 'var window.AliLowCodeEngineExt',
    '@ali/lowcode-engine': 'var window.AliLowCodeEngine',
    moment: 'var window.moment',
    lodash: 'var window._'
  }
}
