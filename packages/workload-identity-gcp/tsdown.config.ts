import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  outDir: 'lib',
  clean: true,
  sourcemap: true,
  exports: true,
  publint: true,
  attw: { profile: 'node16' },
});
