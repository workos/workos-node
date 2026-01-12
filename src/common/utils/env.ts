/**
 * Cross-runtime environment variable helper
 */

type Runtime =
  | 'node'
  | 'deno'
  | 'bun'
  | 'cloudflare'
  | 'fastly'
  | 'edge-light'
  | 'other';

let detectedRuntime: Runtime | null = null;

/**
 * Detect the current runtime environment.
 * This function checks for various runtime environments such as Node.js, Deno, Bun, Cloudflare Workers, Fastly, and Edge Light.
 * It returns a string representing the detected runtime and caches the result for future calls.
 * @returns The detected runtime environment as a string.
 */
export function detectRuntime(): Runtime {
  if (detectedRuntime) {
    return detectedRuntime;
  }

  const global = globalThis as any;

  if (typeof process !== 'undefined' && process.release?.name === 'node') {
    detectedRuntime = 'node';
  } else if (typeof global.Deno !== 'undefined') {
    detectedRuntime = 'deno';
  } else if (
    typeof navigator !== 'undefined' &&
    navigator.userAgent?.includes('Bun')
  ) {
    detectedRuntime = 'bun';
  } else if (
    typeof navigator !== 'undefined' &&
    navigator.userAgent?.includes('Cloudflare')
  ) {
    detectedRuntime = 'cloudflare';
  } else if (typeof global !== 'undefined' && 'fastly' in global) {
    detectedRuntime = 'fastly';
  } else if (typeof global !== 'undefined' && 'EdgeRuntime' in global) {
    detectedRuntime = 'edge-light';
  } else {
    detectedRuntime = 'other';
  }

  return detectedRuntime;
}

function getEnvironmentVariable(key: string): string | undefined {
  const runtime = detectRuntime();
  const global = globalThis as any;

  try {
    switch (runtime) {
      case 'node':
      case 'bun':
      case 'edge-light':
        return process.env[key];

      case 'deno':
        return global.Deno.env.get(key);

      case 'cloudflare':
        return global.env?.[key] ?? global[key];

      case 'fastly':
        return global[key];

      default:
        return process?.env?.[key] ?? global.env?.[key] ?? global[key];
    }
  } catch {
    return undefined;
  }
}

/**
 * Get an environment variable value, trying to access it in different runtimes.
 * @param key - The name of the environment variable.
 * @param defaultValue - The default value to return if the variable is not found.
 * @return The value of the environment variable or the default value.
 */
export function getEnv<T = string>(
  key: string,
  defaultValue?: T,
): string | T | undefined {
  return getEnvironmentVariable(key) ?? defaultValue;
}
