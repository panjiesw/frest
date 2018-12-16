module.exports = {
  preset: 'ts-jest',
  cacheDirectory: 'node_modules/.cache/jest',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/**/src/**/*.ts',
    '!<rootDir>/**/src/**/*.test.ts',
    '!<rootDir>/**/src/**/index.ts',
    '!<rootDir>/**/src/**/umd.ts',
    '!**/__fixtures__/**',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    '/__tests__/',
    '/__fixtures__/',
    '/node_modules/',
    '/esm/',
    '/cjs/',
    '/dist/',
  ],
  setupTestFrameworkScriptFile: '@test/helpers/index.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/src/**/*.test.(j|t)s?(x)'],
};
