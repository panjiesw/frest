const base = require('./config/jest.base');

module.exports = {
  ...base,
  projects: ['<rootDir>/packages/frest'],
};
