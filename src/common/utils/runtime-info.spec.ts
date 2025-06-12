import { getRuntimeInfo } from './runtime-info';
import { detectRuntime } from './env';

// Mock the env module
jest.mock('./env');
const mockDetectRuntime = detectRuntime as jest.MockedFunction<
  typeof detectRuntime
>;

describe('RuntimeInfo', () => {
  let originalProcess: any;
  let originalGlobalThis: any;
  let originalNavigator: any;

  beforeEach(() => {
    // Store original globals
    originalProcess = global.process;
    originalGlobalThis = globalThis;
    originalNavigator = global.navigator;

    // Reset mocks
    mockDetectRuntime.mockReset();
  });

  afterEach(() => {
    // Restore original globals
    global.process = originalProcess;
    Object.assign(globalThis, originalGlobalThis);
    global.navigator = originalNavigator;
  });

  describe('Node.js runtime', () => {
    it('returns node runtime with version', () => {
      mockDetectRuntime.mockReturnValue('node');
      global.process = { version: 'v20.5.0' } as any;

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'node',
        version: 'v20.5.0',
      });
    });

    it('handles missing process.version gracefully', () => {
      mockDetectRuntime.mockReturnValue('node');
      global.process = {} as any;

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'node',
        version: undefined,
      });
    });

    it('handles missing process object gracefully', () => {
      mockDetectRuntime.mockReturnValue('node');
      delete (global as any).process;

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'node',
        version: undefined,
      });
    });
  });

  describe('Deno runtime', () => {
    it('returns deno runtime with version', () => {
      mockDetectRuntime.mockReturnValue('deno');
      (globalThis as any).Deno = {
        version: { deno: '1.36.4' },
      };

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'deno',
        version: '1.36.4',
      });
    });

    it('handles missing Deno.version gracefully', () => {
      mockDetectRuntime.mockReturnValue('deno');
      (globalThis as any).Deno = {};

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'deno',
        version: undefined,
      });
    });

    it('handles missing Deno object gracefully', () => {
      mockDetectRuntime.mockReturnValue('deno');

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'deno',
        version: undefined,
      });
    });
  });

  describe('Bun runtime', () => {
    it('returns bun runtime with version from Bun.version', () => {
      mockDetectRuntime.mockReturnValue('bun');
      (globalThis as any).Bun = { version: '1.0.0' };

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'bun',
        version: '1.0.0',
      });
    });

    it('falls back to navigator.userAgent for Bun version', () => {
      mockDetectRuntime.mockReturnValue('bun');
      // Clear any existing Bun global
      delete (globalThis as any).Bun;
      global.navigator = {
        userAgent: 'Bun/1.0.25',
      } as any;

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'bun',
        version: '1.0.25',
      });
    });

    it('handles missing version sources gracefully', () => {
      mockDetectRuntime.mockReturnValue('bun');
      // Clear any existing Bun global and navigator
      delete (globalThis as any).Bun;
      delete (global as any).navigator;

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'bun',
        version: undefined,
      });
    });

    it('handles malformed navigator.userAgent gracefully', () => {
      mockDetectRuntime.mockReturnValue('bun');
      // Clear any existing Bun global
      delete (globalThis as any).Bun;
      global.navigator = {
        userAgent: 'SomeOtherRuntime/1.0.0',
      } as any;

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'bun',
        version: undefined,
      });
    });
  });

  describe('Edge runtimes', () => {
    it.each(['cloudflare', 'fastly', 'edge-light', 'other'] as const)(
      'returns %s runtime without version',
      (runtime) => {
        mockDetectRuntime.mockReturnValue(runtime);

        const result = getRuntimeInfo();

        expect(result).toEqual({
          name: runtime,
          version: undefined,
        });
      },
    );
  });

  describe('Error handling', () => {
    it('handles exceptions during version detection gracefully', () => {
      mockDetectRuntime.mockReturnValue('node');

      // Create a process object that throws when accessing version
      global.process = {
        get version() {
          throw new Error('Access denied');
        },
      } as any;

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'node',
        version: undefined,
      });
    });

    it('handles exceptions during Deno version detection gracefully', () => {
      mockDetectRuntime.mockReturnValue('deno');

      // Create a Deno object that throws when accessing version
      (globalThis as any).Deno = {
        get version() {
          throw new Error('Access denied');
        },
      };

      const result = getRuntimeInfo();

      expect(result).toEqual({
        name: 'deno',
        version: undefined,
      });
    });
  });

  describe('Real-world scenarios', () => {
    it('works with actual Node.js environment', () => {
      // Test with real Node.js environment
      mockDetectRuntime.mockReturnValue('node');

      const result = getRuntimeInfo();

      // In test environment, this should be Node.js with real process.version
      expect(result.name).toBe('node');
      expect(result.version).toMatch(/^v\d+\.\d+\.\d+/);
    });
  });
});
