/* eslint-env node */
module.exports = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  verbose: true,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['./setup-jest.ts'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.m?js$': '<rootDir>/jest-transform-esm.cjs',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(iron-webcrypto|uint8array-extras|@noble|@scure|jose)/)',
  ],
};
