import { defineConfig } from 'tsup'

export default defineConfig([
  // ESM build for modern runtimes (Deno, Bun, Workers, etc)
  {
    entry: {
      index: 'src/index.worker.ts', // Use worker version for runtime compatibility
      'index.worker': 'src/index.worker.ts',
    },
    format: 'esm',
    outDir: 'lib',
    dts: true,
    clean: true,
    target: 'es2022',
    platform: 'neutral',
    noExternal: [/.*/], // Bundle all dependencies for runtime compatibility
    esbuildOptions(options) {
      // Use worker-compatible versions of modules for edge runtime
      options.mainFields = ['browser', 'module', 'main']
      options.conditions = ['worker', 'browser', 'import', 'default']
      options.platform = 'browser' // This ensures proper polyfills for edge runtime
    },
  },
  // CJS build for Node.js backward compatibility  
  {
    entry: {
      index: 'src/index.ts', // Node-specific version
      'index.worker': 'src/index.worker.ts',
    },
    format: 'cjs',
    outDir: 'lib/cjs', 
    clean: false,
    target: 'node18',
    platform: 'node',
  },
])