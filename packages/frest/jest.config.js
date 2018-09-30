const base = require('../../config/jest.base');
const pkg = require('./package.json');

module.exports = {
  ...base,
  displayName: pkg.name,
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.cjs.json',
    },
  },
  collectCoverageFrom: [
    ...base.collectCoverageFrom,
    '!<rootDir>/src/FrestError.ts',
  ],
};
