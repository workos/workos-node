import { detectRuntime } from './env';

export interface RuntimeInfo {
  name: string;
  version?: string;
}

/**
 * Get runtime information including name and version.
 * Safely extracts version information for different JavaScript runtimes.
 * @returns RuntimeInfo object with name and optional version
 */
export function getRuntimeInfo(): RuntimeInfo {
  const name = detectRuntime();
  let version: string | undefined;

  try {
    switch (name) {
      case 'node':
        // process.version includes 'v' prefix (e.g., "v20.5.0")
        version = typeof process !== 'undefined' ? process.version : undefined;
        break;

      case 'deno':
        // Deno.version.deno returns just version number (e.g., "1.36.4")
        version = (globalThis as any).Deno?.version?.deno;
        break;

      case 'bun':
        version =
          (globalThis as any).Bun?.version || extractBunVersionFromUserAgent();
        break;

      // These environments typically don't expose version info
      case 'cloudflare':
      case 'fastly':
      case 'edge-light':
      case 'other':
      default:
        version = undefined;
        break;
    }
  } catch {
    version = undefined;
  }

  return {
    name,
    version,
  };
}

/**
 * Extract Bun version from navigator.userAgent as fallback.
 * @returns Bun version string or undefined
 */
function extractBunVersionFromUserAgent(): string | undefined {
  try {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      const match = navigator.userAgent.match(/Bun\/(\d+\.\d+\.\d+)/);
      return match?.[1];
    }
  } catch {
    // Ignore errors
  }
  return undefined;
}
