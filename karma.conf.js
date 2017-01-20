// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const webpackConfig = require('./webpack.config');

module.exports = function(config) {
	const conf = {
		frameworks: ['jasmine'],
		files: [
			{ pattern: 'tests.js', watched: false, included: true },
		],
		preprocessors: {
			'tests.js': [
				'webpack',
				'sourcemap'
			]
		},
		reporters: ['spec'],
		browsers: ['PhantomJS'],
		autoWatch: false,
		singleRun: true,
		webpack: webpackConfig,
		webpackMiddleware: {
			stats: 'errors-only'
		},
		webpackServer: {
			noInfo: true
		},
	};

	if (process.env.COVER === 'true') {
		conf.preprocessors['tests.js'].push('sourcemap-writer');
		conf.preprocessors['tests.js'].push('coverage');

		conf.coverageReporter = {
			dir: 'coverage',
			reporters: [
				{
					type: 'json',
					subdir: '.',
					file: 'coverage.json'
				}
			]
		};

		conf.reporters.push('coverage');
	}

	config.set(conf);
}
