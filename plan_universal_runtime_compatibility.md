# Universal Runtime Compatibility Plan for WorkOS Node.js SDK v8

## Executive Summary

This plan addresses the module resolution issues identified in v8 to ensure the package works correctly across all target runtimes: Next.js/bundlers, standalone Node.js, Deno, Bun, Edge Runtime, and Cloudflare Workers.

## Current State Analysis

### Runtime Compatibility Matrix

| Runtime | CJS Build | ESM Build | Status | Issue |
|---------|-----------|-----------|---------|-------|
| **Next.js/webpack** | ✅ | ✅ | Working | Bundler handles resolution |
| **Node.js standalone** | ❌ | ❌ | Broken | Cross-format imports, missing extensions |
| **Deno** | N/A | ❌ | Broken | Requires explicit .js extensions |
| **Bun** | ✅ | ✅ | Working | Good compatibility layer |
| **Edge Runtime** | ❌ | ❌ | Unknown | Likely broken (similar to Node.js) |
| **Cloudflare Workers** | ❌ | ❌ | Unknown | Likely broken (similar to Node.js) |

### Root Cause

The current `tsup` configuration with `bundle: false` doesn't rewrite import paths for different module formats:
- **CJS files** try to `require()` ESM files (`.js` extension)
- **ESM files** import without explicit file extensions, breaking strict runtimes

## Solution Strategy

### Phase 1: Immediate Fix (Import Path Rewriting)

**Objective**: Make all builds work standalone while preserving bundler compatibility.

#### 1.1 Install Required Dependencies

```bash
pnpm add -D esbuild-plugin-file-path-extensions
```

#### 1.2 Update tsup Configuration

Replace current `tsup.config.ts`:

```typescript
import { defineConfig } from 'tsup';
import { filePathExtensions } from 'esbuild-plugin-file-path-extensions';

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
    
    // Add import rewriting plugin
    options.plugins = options.plugins || [];
    options.plugins.push(
      filePathExtensions({
        esm: {
          // For ESM builds, add .js extensions to relative imports
          transform: ({ path, importer }) => {
            if (path.startsWith('./') || path.startsWith('../')) {
              return path.endsWith('.js') ? path : `${path}.js`;
            }
            return path;
          }
        },
        cjs: {
          // For CJS builds, ensure we import from .cjs files
          transform: ({ path, importer }) => {
            if (path.startsWith('./') || path.startsWith('../')) {
              return path.endsWith('.cjs') ? path : `${path}.cjs`;
            }
            return path;
          }
        }
      })
    );
  },
});
```

#### 1.3 Alternative Approach (If plugin doesn't work)

If the plugin approach fails, implement a custom solution:

```typescript
import { defineConfig } from 'tsup';
import { Plugin } from 'esbuild';

// Custom import rewriter plugin
const importRewriterPlugin = (format: 'cjs' | 'esm'): Plugin => ({
  name: 'import-rewriter',
  setup(build) {
    const extension = format === 'cjs' ? '.cjs' : '.js';
    
    build.onResolve({ filter: /^\.\.?\/.*/ }, async (args) => {
      const resolved = await build.resolve(args.path, {
        resolveDir: args.resolveDir,
        kind: args.kind,
      });
      
      if (resolved.errors.length === 0) {
        return resolved;
      }
      
      // Try with our extension
      const pathWithExt = args.path + extension;
      return build.resolve(pathWithExt, {
        resolveDir: args.resolveDir,
        kind: args.kind,
      });
    });
  },
});

export default defineConfig({
  // ... existing config
  esbuildOptions(options, { format }) {
    options.keepNames = true;
    options.plugins = options.plugins || [];
    options.plugins.push(importRewriterPlugin(format as 'cjs' | 'esm'));
  },
});
```

### Phase 2: Testing Infrastructure

#### 2.1 Runtime Test Scripts

Create `scripts/test-runtimes.js`:

```javascript
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const tests = [
  {
    name: 'Node.js CJS',
    cmd: 'node',
    args: ['-e', 'const { WorkOS } = require("./lib/index.cjs"); console.log("✅ CJS:", typeof WorkOS);']
  },
  {
    name: 'Node.js ESM',
    cmd: 'node',
    args: ['-e', 'import("./lib/index.js").then(({ WorkOS }) => console.log("✅ ESM:", typeof WorkOS));']
  },
  {
    name: 'Deno ESM',
    cmd: 'deno',
    args: ['run', '--allow-read', './lib/index.js']
  },
  {
    name: 'Bun CJS',
    cmd: 'bun',
    args: ['-e', 'const { WorkOS } = require("./lib/index.cjs"); console.log("✅ Bun CJS:", typeof WorkOS);']
  },
  {
    name: 'Bun ESM',
    cmd: 'bun',
    args: ['-e', 'import("./lib/index.js").then(({ WorkOS }) => console.log("✅ Bun ESM:", typeof WorkOS));']
  }
];

async function runTest(test) {
  return new Promise((resolve) => {
    const child = spawn(test.cmd, test.args, { stdio: 'pipe' });
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => stdout += data);
    child.stderr.on('data', (data) => stderr += data);
    
    child.on('close', (code) => {
      resolve({
        name: test.name,
        success: code === 0,
        stdout,
        stderr
      });
    });
  });
}

async function main() {
  console.log('🧪 Testing runtime compatibility...\n');
  
  for (const test of tests) {
    try {
      const result = await runTest(test);
      if (result.success) {
        console.log(`✅ ${result.name}: PASSED`);
        if (result.stdout.trim()) console.log(`   ${result.stdout.trim()}`);
      } else {
        console.log(`❌ ${result.name}: FAILED`);
        if (result.stderr.trim()) console.log(`   ${result.stderr.trim()}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
}

main();
```

#### 2.2 Add npm Scripts

Update `package.json`:

```json
{
  "scripts": {
    "test:runtimes": "node scripts/test-runtimes.js",
    "test:all": "pnpm test && pnpm test:runtimes",
    "prebuild": "pnpm clean",
    "postbuild": "pnpm test:runtimes"
  }
}
```

### Phase 3: Enhanced Package.json Configuration

#### 3.1 Improved Exports

Ensure optimal runtime selection:

```json
{
  "type": "module",
  "main": "./lib/index.cjs",
  "module": "./lib/index.js",
  "types": "./lib/index.d.ts",
  "exports": {
    ".": {
      "types": {
        "require": "./lib/index.d.cts",
        "import": "./lib/index.d.ts"
      },
      "workerd": {
        "import": "./lib/index.worker.js",
        "require": "./lib/index.worker.cjs"
      },
      "edge-light": {
        "import": "./lib/index.worker.js",
        "require": "./lib/index.worker.cjs"
      },
      "deno": "./lib/index.js",
      "bun": {
        "import": "./lib/index.js",
        "require": "./lib/index.cjs"
      },
      "node": {
        "import": "./lib/index.js",
        "require": "./lib/index.cjs"
      },
      "import": "./lib/index.js",
      "require": "./lib/index.cjs",
      "default": "./lib/index.js"
    },
    "./worker": {
      "types": {
        "require": "./lib/index.worker.d.cts",
        "import": "./lib/index.worker.d.ts"
      },
      "import": "./lib/index.worker.js",
      "require": "./lib/index.worker.cjs",
      "default": "./lib/index.worker.js"
    },
    "./package.json": "./package.json"
  }
}
```

### Phase 4: CI/CD Integration

#### 4.1 GitHub Actions Workflow

Create `.github/workflows/runtime-tests.yml`:

```yaml
name: Runtime Compatibility Tests

on: [push, pull_request]

jobs:
  test-runtimes:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
          
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Test runtimes
        run: pnpm test:runtimes
```

## Implementation Timeline

### Week 1: Core Fix Implementation
- [ ] Install and configure import rewriting solution
- [ ] Update tsup configuration
- [ ] Test basic functionality across runtimes
- [ ] Fix any immediate issues

### Week 2: Testing & Validation
- [ ] Implement comprehensive runtime tests
- [ ] Validate Next.js/bundler compatibility still works
- [ ] Test edge cases and error scenarios
- [ ] Performance testing

### Week 3: CI/CD & Documentation
- [ ] Set up automated runtime testing
- [ ] Update documentation with runtime requirements
- [ ] Create migration guide for users
- [ ] Prepare release notes

## Success Criteria

✅ **All runtimes pass basic import/require tests**
✅ **Next.js/webpack bundler compatibility maintained**
✅ **Tree-shaking still works properly**
✅ **No regression in package size**
✅ **CI/CD validates all runtimes automatically**

## Rollback Plan

If issues arise:

1. **Immediate**: Revert to `bundle: true` as emergency fix
2. **Short-term**: Release patch with bundled version
3. **Long-term**: Revisit import rewriting approach

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|---------|------------|
| Plugin incompatibility | Medium | High | Test extensively, have bundle fallback |
| Performance regression | Low | Medium | Benchmark before/after |
| Bundler compatibility issues | Low | High | Test with major bundlers |
| New runtime incompatibilities | Medium | Medium | Comprehensive CI testing |

## Next Steps

1. **Implement Phase 1** (import rewriting fix)
2. **Test thoroughly** across all target runtimes
3. **Validate** that existing bundler usage continues to work
4. **Deploy** with confidence that universal compatibility is achieved

This plan ensures the WorkOS Node.js SDK v8 will work seamlessly across all modern JavaScript runtimes while maintaining the benefits of the current architecture.