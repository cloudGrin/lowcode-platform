// @ts-check

// @ts-ignore
const withLess = require('next-with-less')
// @ts-ignore
const withPlugins = require('next-compose-plugins')
// @ts-ignore
// const optimizedImages = require("next-optimized-images");
// const withTM = require("next-transpile-modules")(["antd"]);

const path = require('path')

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  pageExtensions: ['page.tsx', 'api.ts', 'api.js'],
  reactStrictMode: true,
  swcMinify: true,
  // assetPrefix: "",
  // distDir: "dist",
  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   // Important: return the modified config
  //   const assetRegex = new RegExp(`.(png|jpe?g|gif|woff|woff2|ico)$`);
  //   config.module.rules.push({
  //     test: assetRegex,
  //     type: "asset/resource",
  //     generator: {
  //       filename: "./static/assets/[name]-[contenthash].[ext]",
  //     },
  //   });

  //   return config;
  // },
}

const plugins = [
  [
    withLess,
    {
      lessLoaderOptions: {
        /* config for next-with-less */
        additionalData: (/** @type {any} */ content) => {
          return `${content}\n\n@import '${path.resolve('./styles/antd-custom.less')}';`
        }
      }
    }
  ]
  // [
  //   optimizedImages,
  //   {
  //     /* config for next-optimized-images */
  //     handleImages: ["svg"],
  //   },
  // ],
  // withTM,
]

if (process.env.NODE_ENV === 'production') {
  /** 包分析 */
  plugins.push([
    // @ts-ignore
    require('@next/bundle-analyzer')({
      enabled: process.env.ANALYZE === 'true'
    })
  ])
}

module.exports = async (phase) => withPlugins(plugins, nextConfig)(phase, { defaultConfig: undefined })
