module.exports = {
  cacheDirectory: 'node_modules/.cache/jest',
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
    '/lib/',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFiles: ['./test-setup.js'],
  testMatch: ['**/*.test.(j|t)s?(x)'],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
  },
}
