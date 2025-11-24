/** Local-only Jest config for running TS (ESM) tests */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  extensionsToTreatAsEsm: ['.ts'],

  // Transform TS/JS using Babel so "import" works everywhere
  transform: {
    '^.+\\.(ts|js)$': ['babel-jest', { rootMode: 'upward' }],
  },

  // Allow imports written like "../db.js" in TS by stripping the .js
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
