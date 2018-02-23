const path = require('path');
const webpack = require('webpack');
// @ts-ignore
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// @ts-ignore
const pkg = require('./package.json');

const banner = `frest-interceptor-json 0.2.1
https://github.com/panjiesw/frest
License: https://opensource.org/licenses/MIT
© 2017 Panjie Setiawan Wicaksono`

const config = {
  devtool: 'source-map',
  entry: './src/index.ts',
  output: {
    path: path.join(__dirname, 'umd'),
    filename: 'frest-interceptor-json.umd.js',
    library: 'frestInterceptorJson',
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
          }
        ]
      }
    ]
  },
  externals: {
    frest: {
      commonjs: 'frest',
      commonjs2: 'frest',
      root: 'frest',
    }
  },
  plugins: [
    new webpack.BannerPlugin({
      banner
    }),
    new UglifyJsPlugin({
      sourceMap: true,
      uglifyOptions: {
        output: {
          comments: /^!/,
        }
      },
    }),
  ],
}

module.exports = config;
