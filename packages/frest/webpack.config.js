const path = require('path');
const webpack = require('webpack');
// @ts-ignore
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// @ts-ignore
const pkg = require('./package.json');

const banner = `frest ${pkg.version}
https://github.com/panjiesw/frest
License: https://opensource.org/licenses/MIT
© 2017 Panjie Setiawan Wicaksono`

const config = {
  devtool: 'source-map',
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
            options: {
              configFile: 'tsconfig.umd.json'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner
    }),
    // new UglifyJsPlugin({
    //   sourceMap: true,
    //   uglifyOptions: {
    //     output: {
    //       comments: /^!/,
    //     }
    //   },
    // }),
  ],
}

module.exports = config;
