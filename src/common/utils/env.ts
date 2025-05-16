/**
 * Cross-runtime environment variable helper
 */

// Declare global types for runtime environments
declare global {
  // Deno namespace declaration
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }

  // Extend globalThis for Cloudflare Workers
  interface GlobalThis {
    env?: Record<string, string>;
    [key: string]: any;
  }
}

function getEnvironmentVariable(key: string): string | undefined {
  // Node.js
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  // Deno
  if (typeof (globalThis as any).Deno !== 'undefined') {
    return (globalThis as any).Deno.env.get(key);
  }

  // Cloudflare Workers (via global env object)
  if (typeof globalThis !== 'undefined' && (globalThis as any).env) {
    return (globalThis as any).env[key];
  }

  // Cloudflare Workers (direct global access)
  if (typeof globalThis !== 'undefined' && key in globalThis) {
    return (globalThis as any)[key];
  }

  return undefined;
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

