import { defineConfig } from 'tsdown';

const entry = [
  'src/**/*.ts',
  '!src/**/*.spec.ts',
  '!src/**/*.test.ts',
  '!src/**/fixtures/**',
  '!src/**/*.d.ts',
  '!src/**/test-utils.ts',
];

export default defineConfig([
  // ESM build
  {
    entry,
    format: 'esm',
    outDir: 'lib/esm',
    target: 'es2022',
    sourcemap: true,
    clean: true,
    dts: false,
    unbundle: true,
    outExtensions() {
      return { js: '.js' };
    },
  },
  // CJS build
  {
    entry,
    format: 'cjs',
    outDir: 'lib/cjs',
    target: 'es2022',
    sourcemap: true,
    clean: false,
    dts: false,
    unbundle: true,
    outExtensions() {
      return { js: '.cjs' };
    },
  },
  // Types only
  {
    entry,
    format: 'esm',
    outDir: 'lib/types',
    dts: {
      only: true,
    },
    unbundle: true,
    outExtensions() {
      return { js: '.js', dts: '.d.ts' };
    },
  },
]);
