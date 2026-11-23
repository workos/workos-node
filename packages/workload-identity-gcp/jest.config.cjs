module.exports = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  verbose: true,
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    // The repository's shared Babel transform.
    '^.+\\.m?[jt]s$': '<rootDir>/../../jest-transform-esm.cjs',
  },
};
