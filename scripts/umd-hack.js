// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const path = require('path');
const replace = require('replace-in-file');
const cc = require('camelcase');

['frest', 'frest-interceptor-json'].forEach((package) => {
	const pjson = require(`../packages/${package}/package.json`);
	replace.sync({
		files: `${process.cwd()}/.build/${package}/umd/*`,
		replace: [
			new RegExp(`exports\\["${package}`, 'g'),
			new RegExp(`root\\["${package}`, 'g'),
			/<<pname>>/,
			/<<pversion>>/,
		],
		with: [
			`exports["${cc(package)}`,
			`root["${cc(package)}`,
			pjson.name,
			pjson.version,
		]
	})
})
