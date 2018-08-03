// Webpack production configuration

/**
 * The path module provides utilities for working with file and directory paths
 */
const path = require('path');

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
 * This plugin extracts critical CSS and runs after all files have been emitted
 */
const HtmlCriticalWebpackPlugin = require('html-critical-webpack-plugin');

/**
 * Plugin that simplifies creation of HTML files to serve your bundles
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * A JavaScript parser, mangler/compressor and beautifier toolkit for ES6+.
 */
const UglifyJS = require('uglify-es');
/**
 * variable to hold HtmlWebpackPlugin's minify options
 */
const minify = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  sortAttributes: true,
  sortClassName: true,
  useShortDoctype: true
};

module.exports = merge(common, {
  mode: 'production',
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
      {
        from: 'src/sw.js',
        to: '.',
        transform(content) {
          return Promise.resolve(Buffer.from(UglifyJS.minify(content.toString()).code, 'utf8'));
        }
      },
      {
        from: 'src/icons',
        to: './icons',
      },
      'src/manifest.json',
      'src/browserconfig.xml'
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      chunks: ['index'],
      minify
    }),
    new HtmlWebpackPlugin({
      filename: 'restaurant.html',
      template: 'src/restaurant.html',
      chunks: ['restaurant'],
      minify
    }),
    new MiniCssExtractPlugin({
      filename: './[name].css',
      chunkFilename: './[id].css'
    }),
    new HtmlCriticalWebpackPlugin({
      base: path.resolve(__dirname, 'dist'),
      src: 'index.html',
      dest: 'index.html',
      inline: true,
      minify: true,
      extract: true,
      width: 375,
      height: 565,
      penthouse: {
        blockJSRequests: false,
      }
    }),
    new HtmlCriticalWebpackPlugin({
      base: path.resolve(__dirname, 'dist'),
      src: 'restaurant.html',
      dest: 'restaurant.html',
      inline: true,
      minify: true,
      extract: true,
      width: 375,
      height: 565,
      penthouse: {
        blockJSRequests: false,
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          // The css-loader interprets @import and url() like import/require() and will resolve them.
          'css-loader',
          // loader to process CSS with PostCSS
          'postcss-loader',
          // Loader to transpile sass/scss files
          'sass-loader'
        ]
      }
    ]
  }
});