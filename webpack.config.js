// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const atl = require('awesome-typescript-loader');

const CheckerPlugin = atl.CheckerPlugin;
const TsConfigPathsPlugin = atl.TsConfigPathsPlugin;
const banner = `<<pname>> <<pversion>>
https://github.com/panjiesw/frest
License: https://opensource.org/licenses/MIT
© 2017 Panjie Setiawan Wicaksono`

module.exports = (env) => {
	env = env || {};
	if (env.p) {
		process.env.NODE_ENV = 'production';
	}

	const common = () => ({
		devtool: env.p ? 'cheap-module-source-map' : process.env.COVER ? 'inline-source-map' : 'eval-source-map',
		resolve: {
			unsafeCache: false,
			extensions: ['.js', '.ts', '.json'],
			mainFields: ['browser', 'web', 'browserify', 'main'],
			modules: [
				'node_modules'
			],
			alias: {
				frest: path.join(__dirname, 'src', 'frest'),
				'frest-interceptor-json': path.join(__dirname, 'src', 'frest-interceptor-json'),
			}
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'awesome-typescript-loader',
					exclude: [
						/node_modules/,
						path.resolve(__dirname, '.build'),
						path.resolve(__dirname, '.tmp'),
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
	});

	if (env.p) {
		return webpackMerge(common(), {
			entry: {
				frest: './src/frest/index.ts',
				'frest-interceptor-json': './src/frest-interceptor-json/index.ts',
			},
			output: {
				path: path.resolve(__dirname, '.build'),
				filename: env.m ? '[name]/umd/[name].min.js' : '[name]/umd/[name].js',
				library: '[name]',
				libraryTarget: 'umd'
			},
			plugins: [
				new webpack.BannerPlugin({
					banner
				})
			]
		})
	}
	return common();
};
