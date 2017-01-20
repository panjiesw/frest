// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const istanbul = require('istanbul');
const collector = new istanbul.Collector();
const reporter = new istanbul.Reporter();

const remappedJson = require('../coverage/coverage-remapped.json');
const coverage = Object.keys(remappedJson).reduce((result, source) => {
  // only keep js files under src/
  if (source.match(/src\/.*\.ts$/)) {
    result[source] = remappedJson[source];
  }

  return result;
}, {});

collector.add(coverage);

reporter.add('lcov');
reporter.add('cobertura');
reporter.add('text');
reporter.write(
  collector,
  true,
  () => console.log('Coverage reports generated in `coverage` dir')
);
