type EnvModule = typeof import('./env');
type RuntimeInfoModule = typeof import('./runtime-info');

// Each test loads a fresh copy of the module so the cached `detectedRuntime`
// from one test never leaks into another.
function loadEnv(): EnvModule {
  let mod!: EnvModule;
  jest.isolateModules(() => {
    mod = require('./env');
  });
  return mod;
}

function loadRuntimeInfo(): RuntimeInfoModule {
  let mod!: RuntimeInfoModule;
  jest.isolateModules(() => {
    mod = require('./runtime-info');
  });
  return mod;
}

const restores: (() => void)[] = [];

function stub(target: object, key: string, value: unknown): void {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
  restores.push(() => {
    if (original) {
      Object.defineProperty(target, key, original);
    } else {
      delete (target as Record<string, unknown>)[key];
    }
  });
}

function unset(target: object, key: string): void {
  if (key in target) {
    stub(target, key, undefined);
    delete (target as Record<string, unknown>)[key];
  }
}

function userAgent(ua: string): void {
  stub(globalThis, 'navigator', { userAgent: ua });
}

function nodeRelease(): void {
  stub(process, 'release', { name: 'node' });
}

function noNodeRelease(): void {
  stub(process, 'release', undefined);
}

const nodeVersionsWithoutBun = () => {
  const { bun: _bun, ...rest } = process.versions as Record<
    string,
    string | undefined
  >;
  return rest;
};

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = process.env;
  process.env = { ...originalEnv };
  delete process.env.WORKOS_API_KEY;

  // Start every test from a neutral runtime: no runtime globals, no navigator.
  for (const key of ['Deno', 'Bun', 'EdgeRuntime', 'fastly', 'env']) {
    unset(globalThis, key);
  }
  stub(globalThis, 'navigator', undefined);
  stub(process, 'versions', nodeVersionsWithoutBun());
  nodeRelease();
});

afterEach(() => {
  while (restores.length) {
    restores.pop()!();
  }
  process.env = originalEnv;
});

describe('detectRuntime', () => {
  it('detects Deno even though process.release.name is "node"', () => {
    stub(globalThis, 'Deno', {
      env: { get: jest.fn() },
      version: { deno: '2.9.7' },
    });
    userAgent('Deno/2.9.7');
    expect(process.release.name).toBe('node');

    expect(loadEnv().detectRuntime()).toBe('deno');
  });

  it('detects Bun from globalThis.Bun even though process.release.name is "node"', () => {
    stub(globalThis, 'Bun', { version: '1.4.3' });

    expect(loadEnv().detectRuntime()).toBe('bun');
  });

  it('detects Bun from process.versions.bun alone', () => {
    stub(process, 'versions', { ...nodeVersionsWithoutBun(), bun: '1.4.3' });

    expect(loadEnv().detectRuntime()).toBe('bun');
  });

  it('detects Bun from navigator.userAgent alone', () => {
    userAgent('Bun/1.4.3');

    expect(loadEnv().detectRuntime()).toBe('bun');
  });

  it('detects plain Node', () => {
    expect(loadEnv().detectRuntime()).toBe('node');
  });

  it('detects plain Node with a Node navigator.userAgent', () => {
    userAgent('Node.js/22');

    expect(loadEnv().detectRuntime()).toBe('node');
  });

  it('detects Cloudflare Workers with nodejs_compat (process.release.name "node")', () => {
    userAgent('Cloudflare-Workers');

    expect(loadEnv().detectRuntime()).toBe('cloudflare');
  });

  it('detects Cloudflare Workers without nodejs_compat', () => {
    userAgent('Cloudflare-Workers');
    noNodeRelease();

    expect(loadEnv().detectRuntime()).toBe('cloudflare');
  });

  it('detects Fastly', () => {
    noNodeRelease();
    stub(globalThis, 'fastly', {});

    expect(loadEnv().detectRuntime()).toBe('fastly');
  });

  it('detects edge-light', () => {
    noNodeRelease();
    stub(globalThis, 'EdgeRuntime', 'edge-runtime');

    expect(loadEnv().detectRuntime()).toBe('edge-light');
  });

  it('falls back to other', () => {
    noNodeRelease();

    expect(loadEnv().detectRuntime()).toBe('other');
  });

  describe('cache', () => {
    it('returns the first result even after the globals change', () => {
      const env = loadEnv();
      expect(env.detectRuntime()).toBe('node');

      stub(globalThis, 'Deno', { env: { get: jest.fn() } });

      expect(env.detectRuntime()).toBe('node');
      expect(loadEnv().detectRuntime()).toBe('deno');
    });

    it('caches Deno within a test', () => {
      stub(globalThis, 'Deno', { env: { get: jest.fn() } });

      expect(loadEnv().detectRuntime()).toBe('deno');
    });

    it('does not leak the previous test’s result', () => {
      expect(loadEnv().detectRuntime()).toBe('node');
    });
  });
});

describe('getEnv', () => {
  it('reads Deno.env.get under Deno', () => {
    const get = jest.fn((key: string) =>
      key === 'WORKOS_API_KEY' ? 'from-deno' : undefined,
    );
    stub(globalThis, 'Deno', { env: { get } });
    process.env.WORKOS_API_KEY = 'from-process';

    expect(loadEnv().getEnv('WORKOS_API_KEY')).toBe('from-deno');
    expect(get).toHaveBeenCalledWith('WORKOS_API_KEY');
  });

  it('returns the default under Deno when Deno.env.get throws', () => {
    stub(globalThis, 'Deno', {
      env: {
        get: () => {
          throw new Error('Requires env access');
        },
      },
    });

    expect(loadEnv().getEnv('WORKOS_API_KEY', 'fallback')).toBe('fallback');
  });

  it('reads process.env under Bun', () => {
    stub(globalThis, 'Bun', { version: '1.4.3' });
    process.env.WORKOS_API_KEY = 'from-process';

    expect(loadEnv().getEnv('WORKOS_API_KEY')).toBe('from-process');
  });

  it('reads process.env under Node', () => {
    process.env.WORKOS_API_KEY = 'from-process';

    expect(loadEnv().getEnv('WORKOS_API_KEY')).toBe('from-process');
  });

  describe('Cloudflare', () => {
    beforeEach(() => {
      userAgent('Cloudflare-Workers');
    });

    it('still reads process.env with nodejs_compat (previously detected as node)', () => {
      process.env.WORKOS_API_KEY = 'from-process';

      expect(loadEnv().getEnv('WORKOS_API_KEY')).toBe('from-process');
    });

    it('prefers globalThis.env over process.env', () => {
      stub(globalThis, 'env', { WORKOS_API_KEY: 'from-global-env' });
      process.env.WORKOS_API_KEY = 'from-process';

      expect(loadEnv().getEnv('WORKOS_API_KEY')).toBe('from-global-env');
    });

    it('reads global bindings without nodejs_compat', () => {
      noNodeRelease();
      stub(globalThis, 'WORKOS_API_KEY', 'from-global');

      expect(loadEnv().getEnv('WORKOS_API_KEY')).toBe('from-global');
    });

    it('returns the default when nothing is set', () => {
      expect(loadEnv().getEnv('WORKOS_API_KEY', 'fallback')).toBe('fallback');
    });
  });
});

describe('getRuntimeInfo with the real detectRuntime', () => {
  it('reports Node with process.version', () => {
    expect(loadRuntimeInfo().getRuntimeInfo()).toEqual({
      name: 'node',
      version: process.version,
    });
  });

  it('reports Bun with Bun.version', () => {
    stub(globalThis, 'Bun', { version: '1.4.3' });

    expect(loadRuntimeInfo().getRuntimeInfo()).toEqual({
      name: 'bun',
      version: '1.4.3',
    });
  });

  it('reports Bun with the version from navigator.userAgent', () => {
    userAgent('Bun/1.4.3');

    expect(loadRuntimeInfo().getRuntimeInfo()).toEqual({
      name: 'bun',
      version: '1.4.3',
    });
  });

  it('reports Deno with Deno.version.deno', () => {
    stub(globalThis, 'Deno', {
      env: { get: jest.fn() },
      version: { deno: '2.9.7' },
    });

    expect(loadRuntimeInfo().getRuntimeInfo()).toEqual({
      name: 'deno',
      version: '2.9.7',
    });
  });
});
