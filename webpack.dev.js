// Webpack development configuration

/**
 * This utility allows webpack to 'merge' configurations together.
 * To keep code DRY we can seperate common configuration and merge that into development or production.
 */
const merge = require('webpack-merge');

/**
 * My common webpack congiuration tasks
 */
const common = require('./webpack.common.js');

/**
 * Copies individual files or entire directories to the build directory
 */
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS.
 * It supports On-Demand-Loading of CSS and SourceMaps.
 * It builds on top of a new webpack v4 feature (module types) and requires webpack 4 to work.
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/**
 * This plugin will search for CSS assets during the Webpack build and will optimize \ minimize the CSS
 */
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

/**
 * This plugin will minify the JS
 */
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

/**
 * Plugin that simplifies creation of HTML files to serve your bundles
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      'src/sw.js',
      {
        from: 'src/icons',
        to: './icons',
      },
      'src/manifest.json',
      'src/browserconfig.xml'
    ]),
    new MiniCssExtractPlugin({
      filename: './[name].css',
      chunkFilename: './[id].css'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      filename: 'restaurant.html',
      template: 'src/restaurant.html',
      chunks: ['restaurant']
    })
  ],
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          // The css-loader interprets @import and url() like import/require() and will resolve them.
          {
            loader: 'css-loader',
            options: {
              sourceMap: true // Includes source maps to your CSS files
            }
          },
          // loader to process CSS with PostCSS
          'postcss-loader',
          // Loader to transpile sass/scss files
          'sass-loader'
        ]
      }
    ]
  }
});