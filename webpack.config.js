// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const path = require('path');
const webpack = require('webpack');
const atl = require('awesome-typescript-loader');

const CheckerPlugin = atl.CheckerPlugin;
const TsConfigPathsPlugin = atl.TsConfigPathsPlugin;

module.exports = {
	devtool: process.env.COVER ? 'inline-source-map' : 'eval-source-map',
	resolve: {
		unsafeCache: false,
		extensions: ['.js', '.ts', '.json'],
		mainFields: ['browser', 'web', 'browserify', 'main'],
		modules: [
			'node_modules'
		],
		alias: {
			frest: path.join(__dirname, 'src', 'frest'),
		}
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'awesome-typescript-loader',
				exclude: [
					/node_modules/,
					path.resolve(__dirname, 'build'),
				]
			}
		]
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			debug: true,
			context: __dirname
		}),
		new CheckerPlugin(),
		new TsConfigPathsPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(process.env.NODE_ENV)
			}
		})
	]
}
