// Webpack common configuration

/**
 * The path module provides utilities for working with file and directory paths
 */
const path = require('path');

/**
 * A webpack plugin to remove/clean your build folder(s) before building
 */
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    index: './src/js/index.js',
    restaurant: './src/js/restaurant_info.js'
  },
  output: {
    filename: './[name].bundle.js',
    chunkFilename: './[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(['dist'])
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/,
        include: [
          path.resolve(__dirname, 'node_modules/leaflet/dist/images')
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        exclude: [
          path.resolve(__dirname, 'node_modules/leaflet/dist/images')
        ],
        loader: 'responsive-loader',
        options: {
          adapter: require('responsive-loader/sharp'),
          sizes: [400, 600, 800],
          name: 'images/[name]-[hash]-[width].[ext]',
          placeholder: true,
          placeholderSize: 50
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          },
          'eslint-loader'
        ]
      }
    ]
  }
};