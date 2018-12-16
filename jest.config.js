const base = require('./config/jest.base');
const tsConfig = require('./config/tsconfig.base.json');

module.exports = {
  ...base,
  globals: {
    'ts-jest': {
      tsConfig: {
        ...tsConfig.compilerOptions,
        module: 'commonjs',
      },
    },
  },
  projects: ['<rootDir>/packages/frest'],
};
