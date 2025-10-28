import { defineConfig } from 'tsup';
import { fixImportsPlugin } from 'esbuild-fix-imports-plugin';

export default defineConfig([
  // ESM build
  {
    entry: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      '!src/**/*.test.ts',
      '!src/**/fixtures/**',
      '!src/**/*.d.ts',
      '!src/**/test-utils.ts',
    ],
    format: 'esm',
    outDir: 'lib/esm',
    splitting: false,
    target: 'es2022',
    sourcemap: true,
    clean: true,
    dts: {
      resolve: true,
      compilerOptions: {
        lib: ['dom', 'es2022'],
        types: ['node'],
      },
    },
    bundle: false,
    outExtension() {
      return { js: '.js' };
    },
    esbuildOptions(options) {
      options.keepNames = true;
    },
    esbuildPlugins: [fixImportsPlugin()],
  },
  // CJS build
  {
    entry: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      '!src/**/*.test.ts',
      '!src/**/fixtures/**',
      '!src/**/*.d.ts',
      '!src/**/test-utils.ts',
    ],
    format: 'cjs',
    outDir: 'lib/cjs',
    splitting: false,
    target: 'es2022',
    sourcemap: true,
    clean: false, // Don't clean, keep ESM files
    dts: {
      resolve: true,
      compilerOptions: {
        lib: ['dom', 'es2022'],
        types: ['node'],
      },
    },
    bundle: false,
    outExtension() {
      return { js: '.cjs', dts: '.d.cts' };
    },
    esbuildOptions(options) {
      options.keepNames = true;
    },
    esbuildPlugins: [fixImportsPlugin()],
  },
]);
