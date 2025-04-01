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
    '^.+\\.m?js$': '<rootDir>/jest-transform-esm.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(iron-session|uncrypto|cookie-es)/).+\\.m?js$',
  ],
  moduleNameMapper: {
    '^jose': require.resolve('jose'),
  },
};
