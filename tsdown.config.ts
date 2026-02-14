import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/index.worker.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  outDir: 'lib',
  clean: true,
  inlineOnly: ['iron-webcrypto', 'jose'],
  sourcemap: true,
  exports: {
    customExports: (exports) => {
      const main = exports['.'];
      const worker = exports['./index.worker'];
      return {
        '.': {
          workerd: worker,
          'edge-light': worker,
          convex: { import: worker.import, default: worker.require },
          ...main,
        },
        './worker': worker,
        './package.json': './package.json',
      };
    },
  },
  publint: true,
  attw: { profile: 'node16' },
});
