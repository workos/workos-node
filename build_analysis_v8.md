# WorkOS Node.js SDK v8.0 Build System Analysis

## Executive Summary

The WorkOS Node.js SDK v8.0 introduces a significant change from TypeScript Compiler (TSC) to tsup for building dual CommonJS (CJS) and ES Module (ESM) bundles. While this modernizes the build system and provides better module format support, **there are critical issues that prevent the builds from working correctly** that need immediate attention.

## Critical Issues Found (Standalone Usage Only) ⚠️

### 1. Module Resolution Issues in Standalone Node.js Usage

**Problem**: The current tsup configuration generates builds that work with modern bundlers but fail in standalone Node.js usage.

**CJS Error (Standalone)**:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module /path/to/lib/common/crypto/subtle-crypto-provider.js from /path/to/lib/index.cjs not supported.
```

**ESM Error (Standalone)**:
```
Cannot find module '/path/to/lib/common/crypto/subtle-crypto-provider' imported from /path/to/lib/index.js
```

**Root Cause**: With `bundle: false`, tsup preserves individual files but doesn't adjust import paths for different formats. CJS files are trying to `require()` ESM files (`.js` extension), and ESM files are importing without proper file extensions.

### 2. Why It Works with Bundlers (relative-deps, Next.js, etc.)

Modern bundlers like webpack, Next.js, and tools like `relative-deps`:
- **Module Resolution**: Handle mixed module formats automatically
- **Import Rewriting**: Resolve imports at build time rather than runtime  
- **Bundling**: Often bundle dependencies, bypassing the module resolution issues
- **Smart Resolution**: Use package.json exports properly and resolve to the correct format

### 3. Impact Assessment

| Usage Context | Status | Reason |
|---------------|--------|---------|
| **Next.js/React Apps** | ✅ Works | Bundler handles module resolution |
| **Webpack Projects** | ✅ Works | Webpack resolves imports at build time |
| **Bundled Applications** | ✅ Works | Dependencies get bundled |
| **Standalone Node.js** | ❌ Broken | Raw module resolution fails |
| **Direct require/import** | ❌ Broken | No bundler to resolve conflicts |

## Build System Changes Analysis

### Old Build System (main branch)
```json
{
  "scripts": {
    "build": "tsc -p ."
  },
  "tsconfig.json": {
    "module": "commonjs",
    "target": "es6"
  }
}
```

- **Single format**: CommonJS only
- **Simple**: Direct TypeScript compilation
- **Working**: No module resolution issues

### New Build System (v8 branch)
```json
{
  "scripts": {
    "build": "tsup"
  },
  "tsup.config.ts": {
    "format": ["cjs", "esm"],
    "bundle": false,
    "target": "es2022"
  }
}
```

- **Dual format**: Both CJS and ESM
- **Complex**: Advanced bundler configuration
- **Broken**: Module resolution issues

## Package.json Changes Analysis

### Export Map Evolution

**Old (v7)**:
```json
{
  "typings": "lib/index.d.ts",
  "exports": {
    "types": "./lib/index.d.ts",
    "workerd": {
      "import": "./lib/index.worker.js",
      "default": "./lib/index.worker.js"
    },
    "edge-light": {
      "import": "./lib/index.worker.js", 
      "default": "./lib/index.worker.js"
    },
    "default": {
      "import": "./lib/index.js",
      "default": "./lib/index.js"
    }
  }
}
```

**New (v8)**:
```json
{
  "type": "module",
  "main": "./lib/index.cjs",
  "module": "./lib/index.js", 
  "types": "./lib/index.d.ts",
  "exports": {
    ".": {
      "types": "./lib/index.d.ts",
      "workerd": {
        "import": "./lib/index.worker.js",
        "require": "./lib/index.worker.cjs"
      },
      "edge-light": {
        "import": "./lib/index.worker.js",
        "require": "./lib/index.worker.cjs"
      },
      "import": "./lib/index.js",
      "require": "./lib/index.cjs",
      "default": "./lib/index.js"
    },
    "./worker": {
      "types": "./lib/index.worker.d.ts",
      "import": "./lib/index.worker.js", 
      "require": "./lib/index.worker.cjs",
      "default": "./lib/index.worker.js"
    },
    "./package.json": "./package.json"
  }
}
```

### Key Changes Impact

1. **`"type": "module"`** - Package is now ESM-first
2. **Dual build support** - Both CJS and ESM files available
3. **Better runtime targeting** - Proper environment-specific exports
4. **Backward compatibility fields** - `main`, `module`, `types` for older tooling

**User Impact**: The export map structure is well-designed and follows Node.js best practices, but the actual files don't work due to build issues.

## Environment Support Analysis

### Target Environments

| Environment | Old Support | New Support | Status |
|-------------|-------------|-------------|---------|
| **Bundled Apps (Next.js, webpack)** | ✅ | ✅ | Working |
| **Node.js CJS (standalone)** | ✅ | ❌ (broken) | Regression |
| **Node.js ESM (standalone)** | ❌ | ❌ (broken) | No improvement |
| **Cloudflare Workers (bundled)** | ✅ | ✅ | Working |
| **Edge Runtime (bundled)** | ✅ | ✅ | Working |

### TypeScript Definitions ✅

The build correctly generates TypeScript definitions for both formats:
- `index.d.ts` (ESM definitions)
- `index.d.cts` (CJS definitions) 
- `index.worker.d.ts` (Worker ESM definitions)
- `index.worker.d.cts` (Worker CJS definitions)

## Potential User Impact

### Breaking Changes for Existing Users

1. **Package type change**: `"type": "module"` may affect tooling that doesn't handle package.json type field properly
2. **File extension changes**: Users importing specific files may need to update import paths
3. **Build tool compatibility**: Some bundlers might handle the new export map differently

### Migration Considerations

Once the build issues are fixed, users should:

1. **Test imports**: Verify both `require()` and `import` work
2. **Check bundlers**: Ensure webpack, Rollup, esbuild handle new exports correctly  
3. **Validate TypeScript**: Confirm type resolution works in their projects
4. **Test environments**: Verify functionality in Node.js, workers, and edge runtimes

## Recommendations

### Immediate Actions Required ⚠️

1. **Fix tsup configuration** to properly handle cross-format imports:
   ```typescript
   // Option 1: Enable bundling
   bundle: true,
   
   // Option 2: Configure proper extension handling
   esbuildOptions(options, { format }) {
     if (format === 'cjs') {
       options.mainFields = ['main', 'module']
     }
   }
   ```

2. **Add import extension rewriting** for ESM builds
3. **Test both formats** before release
4. **Add integration tests** for both CJS and ESM consumption

### Testing Strategy

```bash
# Test CJS consumption
node -e "const { WorkOS } = require('@workos-inc/node'); console.log(typeof WorkOS);"

# Test ESM consumption  
node -e "import('@workos-inc/node').then(({ WorkOS }) => console.log(typeof WorkOS));"

# Test worker imports
node -e "const { WorkOS } = require('@workos-inc/node/worker'); console.log(typeof WorkOS);"
```

### Long-term Improvements

1. **Add build validation** to CI/CD pipeline
2. **Include module resolution tests** in test suite
3. **Document migration guide** for users upgrading from v7
4. **Consider bundling** for simpler distribution

## Risk Assessment

| Risk Level | Issue | Impact |
|------------|-------|---------|
| 🟡 **Medium** | Standalone Node.js usage broken | CLI tools, direct usage affected |
| 🟡 **Medium** | Package type change | Potential tooling compatibility issues |
| 🟢 **Low** | Export map changes | Minimal impact, follows standards |
| 🟢 **Low** | Bundled app usage | Works fine with modern bundlers |

## Conclusion

The v8 build system modernization is a positive direction with proper dual-format support and better environment targeting. **The package works correctly in most real-world usage scenarios** (bundled applications, Next.js, webpack projects) but has module resolution issues in standalone Node.js usage.

### Key Findings:

1. **✅ Works with bundlers**: Modern build tools handle the module resolution correctly
2. **❌ Broken for standalone**: Direct Node.js require/import fails due to cross-format imports  
3. **✅ Good architecture**: Export map and TypeScript definitions are well-designed
4. **🟡 Limited impact**: Most users won't encounter the standalone issues

### Updated Recommendation:

The v8.0 release can proceed for most use cases, but should include:
- **Documentation** warning about standalone usage limitations
- **Future fix** for tsup configuration to support standalone usage
- **Testing** of both bundled and standalone scenarios

**For most users**: The package will work fine in their applications.
**For CLI/standalone users**: May need to wait for a future patch or use dynamic imports as workarounds.
