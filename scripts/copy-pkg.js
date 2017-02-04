// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// const fs = require('fs');
const path = require('path');
const cpx = require('cpx');
// const rootPkg = require('../package.json');

const packages = ['frest', 'frest-interceptor-json'];
// const packageJsons = {
// 	frest: {}
// };
// const package = process.argv[2];

// if (package.length < 3) {
// 	console.error('usage: node scripts/dist.js <package>');
// 	return;
// } else if (allowed.indexOf(package) < 0) {
// 	console.error('package not in allowed');
// 	return;
// }

// const pkg = path.resolve(buildDir, 'package.json');
// const pkgJson = JSON.stringify(
// 	Object.assign({},
// 		rootPkg,
// 		packageJsons[package],
// 		{
// 			devDependencies: undefined,
// 			scripts: undefined,
// 		}),
// 	undefined,
// 	'\t');

// const writePkg = () => {
// 	fs.writeFileSync(pkg, pkgJson, { encoding: 'UTF-8' });
// };

const copyFiles = (package) => {
	const buildDir = path.resolve(process.cwd(), '.build', package);
	cpx.copySync(`./packages/${package}/+(README.md|LICENSE|package.json)`, buildDir);
}

packages.forEach(copyFiles)

// writePkg();
// copyFiles();
