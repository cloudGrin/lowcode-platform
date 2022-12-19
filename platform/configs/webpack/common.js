// shared config (dev and prod)
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

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
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.ttf'],
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
          'file-loader?hash=sha512&digest=hex&name=img/[contenthash].[ext]'
          // {
          //   loader: 'image-webpack-loader',
          //   options: {
          //     disable: false, // webpack@2.x and newer
          //     optipng: {
          //       optimizationLevel: 7
          //     },
          //     gifsicle: {
          //       interlaced: false
          //     }
          //   }
          // }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          { loader: 'svg-sprite-loader', options: {} },
          { loader: 'svgo-loader', options: {} }
        ]
      },
      {
        test: /\.ttf$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
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
      },
      customJs: ['https://g.alicdn.com/mylib/moment/2.29.1/min/moment.min.js']
    }),
    new HtmlWebpackPlugin({
      chunks: ['preview'],
      filename: 'preview.html',
      title: 'preview',
      templateParameters: {
        useFor: 'preview'
      }
    })
  ],
  externals: {
    react: 'var window.React',
    'react-dom': 'var window.ReactDOM',
    'prop-types': 'var window.PropTypes',
    '@alilc/lowcode-engine': 'var window.AliLowCodeEngine',
    '@alilc/lowcode-editor-core': 'var window.AliLowCodeEngine.common.editorCabin',
    '@alilc/lowcode-editor-skeleton': 'var window.AliLowCodeEngine.common.skeletonCabin',
    '@alilc/lowcode-designer': 'var window.AliLowCodeEngine.common.designerCabin',
    '@alilc/lowcode-engine-ext': 'var window.AliLowCodeEngineExt',
    '@ali/lowcode-engine': 'var window.AliLowCodeEngine',
    '@alifd/next': 'var window.Next',
    moment: 'var window.moment',
    lodash: 'var window._'
  }
}
