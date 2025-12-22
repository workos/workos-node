import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/fixtures/**',
    '!src/**/*.d.ts',
    '!src/**/test-utils.ts',
  ],
  format: ['esm', 'cjs'],
  outDir: 'lib',
  target: 'es2022',
  sourcemap: true,
  clean: true,
  dts: true,
  unbundle: true,
  // bundle ESM-only deps for CJS compatibility
  noExternal: ['iron-webcrypto', 'uint8array-extras'],
  outExtensions({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
});
