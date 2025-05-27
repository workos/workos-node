import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/fixtures/**',
    '!src/**/*.d.ts',
    '!src/**/test-utils.ts',
  ],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      lib: ['dom', 'es2022'],
      types: ['node'],
    },
  },
  bundle: false,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  platform: 'node',
  outDir: 'lib',
  splitting: false,
  external: ['iron-session', 'jose', 'leb', 'pluralize'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
  esbuildOptions(options, { format }) {
    options.keepNames = true;
  },
});

