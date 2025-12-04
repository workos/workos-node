import { defineConfig } from 'tsup';
import { fixImportsPlugin } from 'esbuild-fix-imports-plugin';

const entry = [
  'src/**/*.ts',
  '!src/**/*.spec.ts',
  '!src/**/*.test.ts',
  '!src/**/fixtures/**',
  '!src/**/*.d.ts',
  '!src/**/test-utils.ts',
];

export default defineConfig([
  // Types only
  {
    entry,
    format: 'esm',
    outDir: 'lib/types',
    dts: {
      only: true, // Only emit declarations, no JS
      compilerOptions: {
        lib: ['dom', 'es2022'],
        types: ['node'],
      },
    },
    bundle: false,
  },
  // ESM build - no types
  {
    entry,
    format: 'esm',
    outDir: 'lib/esm',
    splitting: false,
    target: 'es2022',
    sourcemap: true,
    clean: true,
    dts: false,
    bundle: false,
    outExtension() {
      return { js: '.js' };
    },
    esbuildOptions(options) {
      options.keepNames = true;
    },
    esbuildPlugins: [fixImportsPlugin()],
  },
  // CJS build - no types
  {
    entry,
    format: 'cjs',
    outDir: 'lib/cjs',
    splitting: false,
    target: 'es2022',
    sourcemap: true,
    clean: false,
    dts: false,
    bundle: false,
    outExtension() {
      return { js: '.cjs' };
    },
    esbuildOptions(options) {
      options.keepNames = true;
    },
    esbuildPlugins: [fixImportsPlugin()],
  },
]);
