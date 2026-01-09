import { defineConfig } from 'tsdown';

const sharedEntry = [
  'src/**/*.ts',
  '!src/**/*.spec.ts',
  '!src/**/*.test.ts',
  '!src/**/fixtures/**',
  '!src/**/*.d.ts',
  '!src/**/test-utils.ts',
];

export default defineConfig([
  // ESM - unbundled, external deps (ESM consumers can import ESM deps directly)
  {
    entry: sharedEntry,
    format: ['esm'],
    outDir: 'lib',
    target: 'es2022',
    sourcemap: true,
    clean: true,
    dts: true,
    unbundle: true,
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  },
  // CJS - bundled, inline ESM-only deps for compatibility
  {
    entry: sharedEntry,
    format: ['cjs'],
    outDir: 'lib',
    target: 'es2022',
    sourcemap: true,
    // no clean - ESM build already cleaned
    dts: true, // Generate .d.cts for CJS consumers
    // no unbundle - allows proper inlining of ESM-only deps
    noExternal: ['iron-webcrypto', 'uint8array-extras'],
    outExtensions: () => ({ js: '.cjs', dts: '.d.cts' }),
  },
]);
