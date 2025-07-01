// scripts/ecosystem-check.ts
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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

// Test Cloudflare Worker environment using miniflare
process.stdout.write(`Testing worker      ... `);

// 1. Check if miniflare is available
const miniflareCheck = spawnSync('npx', ['miniflare', '--version'], {
  stdio: 'ignore', // We don't need to see the version output
  encoding: 'utf8',
});

if (miniflareCheck.status !== 0) {
  console.log(`⚠️  Skipped (miniflare not found or failed to execute)`);
} else {
  // 2. Create the temporary worker script
  const workerScriptPath = join(tmp, 'worker-test.js');
  const safeLibEsmPath = libEsm.replace(/\\/g, '\\\\'); // For Windows compatibility

  const workerScriptContent = `
import { WorkOS } from '${safeLibEsmPath}/index.js';

if (WorkOS && WorkOS.name === 'WorkOS') {
  console.log('✅ Worker (miniflare): SDK imported successfully.');
} else {
  console.error('❌ Worker (miniflare): SDK import failed or WorkOS class is incorrect.');
  process.exit(1);
}
`;

  writeFileSync(workerScriptPath, workerScriptContent);

  // 3. Execute the worker script with miniflare
  const { status, stderr } = spawnSync(
    'npx',
    ['miniflare', '--modules', workerScriptPath],
    {
      stdio: ['inherit', 'pipe', 'pipe'],
      encoding: 'utf8',
    },
  );

  // 4. Process the result
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

// Cleanup
rmSync(tmp, { recursive: true, force: true });

console.log(`\n📊 Results: ${ranTests} runtime tests completed`);

if (allOK) {
  console.log('🎉 All core runtime compatibility checks passed!');
} else {
  console.log('💥 Some runtime tests failed. Check the output above.');
  throw new Error('Ecosystem compatibility checks failed');
}
