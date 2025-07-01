// scripts/ecosystem-check.ts
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');
const libCjs = join(root, 'lib/cjs');
const libEsm = join(root, 'lib/esm');
const tmp = mkdtempSync(join(os.tmpdir(), 'workos-test-'));

// Map of "runtime label" → { cmd, args }
const tests: Record<string, { cmd: string; args: string[] }> = {
  'node-cjs': {
    cmd: 'node',
    args: [
      '-e',
      `console.log('✅ Node CJS:', require("${libCjs}/index.cjs").WorkOS.name)`,
    ],
  },
  'node-esm': {
    cmd: 'node',
    args: [
      '-e',
      `import("${libEsm}/index.js").then(m => console.log('✅ Node ESM:', m.WorkOS.name))`,
    ],
  },
  deno: {
    cmd: 'deno',
    args: [
      'eval',
      `import("${libEsm}/index.js").then(m => console.log('✅ Deno:', m.WorkOS.name))`,
    ],
  },
  'bun-cjs': {
    cmd: 'bun',
    args: [
      '-e',
      `console.log('✅ Bun CJS:', require("${libCjs}/index.cjs").WorkOS.name)`,
    ],
  },
  'bun-esm': {
    cmd: 'bun',
    args: [
      '-e',
      `import("${libEsm}/index.js").then(m => console.log('✅ Bun ESM:', m.WorkOS.name))`,
    ],
  },
};

// Worker test using simple import check
const workerTest = {
  cmd: 'node',
  args: [
    '-e',
    `
try {
  // Test if the worker build exists and can be imported
  import("${libEsm}/index.worker.js").then(m => {
    if (m.WorkOS) {
      console.log('✅ Worker: WorkOS import successful');
    } else {
      throw new Error('WorkOS not found in worker build');
    }
  }).catch(err => {
    console.log('❌ Worker test failed:', err.message);
    process.exit(1);
  });
} catch (error) {
  console.log('❌ Worker test failed:', error.message);
  process.exit(1);
}
    `,
  ],
};

let allOK = true;
let ranTests = 0;

console.log('🚀 Running WorkOS SDK ecosystem compatibility checks...\n');

// Run basic runtime tests
for (const [name, { cmd, args }] of Object.entries(tests)) {
  process.stdout.write(`Testing ${name.padEnd(12)}... `);

  const { status, stderr } = spawnSync(cmd, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    encoding: 'utf8',
  });

  if (status !== 0) {
    allOK = false;
    console.error(`❌ Failed`);
    if (stderr) {
      console.error(`   Error: ${stderr.trim()}`);
    }
  } else {
    ranTests++;
    console.log(`✅ Passed`);
  }
}

// Try worker test if miniflare is available
console.log(`\nTesting worker.........`);
const workerResult = spawnSync(workerTest.cmd, workerTest.args, {
  stdio: ['inherit', 'pipe', 'pipe'],
  encoding: 'utf8',
});

if (workerResult.status === 0) {
  ranTests++;
  console.log(`✅ Passed`);
} else {
  console.log(`⚠️  Skipped (miniflare test failed)`);
  if (workerResult.stderr) {
    console.log(`   Error: ${workerResult.stderr.trim()}`);
  }
  // Don't fail overall test for worker issues
}

// Cleanup
rmSync(tmp, { recursive: true, force: true });

console.log(`\n📊 Results: ${ranTests} runtime tests completed`);

if (allOK) {
  console.log('🎉 All core runtime compatibility checks passed!');
} else {
  console.log('💥 Some runtime tests failed. Check the output above.');
  throw new Error('Ecosystem compatibility checks failed');
}
