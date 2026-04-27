module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/app.js'],
  testMatch: ['**/tests/**/*.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
