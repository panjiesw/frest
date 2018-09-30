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
  testPathIgnorePatterns: [
    '/__fixtures__/',
    '/node_modules/'
  ],
  coveragePathIgnorePatterns: ['/__tests__/', '/node_modules/'],
  setupTestFrameworkScriptFile: '@test/helpers/index.js',
};
