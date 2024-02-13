module.exports = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  verbose: true,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  roots: ['<rootDir>/src'],
  setupFiles: ['./setup-jest.ts'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
