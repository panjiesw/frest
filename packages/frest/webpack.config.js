const path = require('path');
const webpack = require('webpack');
// @ts-ignore
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// @ts-ignore
const pkg = require('./package.json');

const banner = `frest 0.5.1
https://github.com/panjiesw/frest
License: https://opensource.org/licenses/MIT
© 2018 Panjie Setiawan Wicaksono`;

const config = {
  entry: './src/index.ts',
  output: {
    path: path.join(__dirname, 'umd'),
    filename: 'frest.umd.js',
    library: 'frest',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [
          /node_modules/,
          path.join(__dirname, 'build'),
          path.join(__dirname, 'es'),
          path.join(__dirname, 'lib'),
          path.join(__dirname, 'umd'),
        ],
        use: [
          // 'babel-loader',
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner,
    }),
    new UglifyJsPlugin({
      sourceMap: true,
      uglifyOptions: {
        output: {
          comments: /^!/,
        },
      },
    }),
  ],
  node: {
    process: false,
  },
};

module.exports = config;