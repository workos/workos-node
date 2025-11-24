let _josePromise: Promise<typeof import('jose')> | undefined;

/**
 * Dynamically imports the jose library using import() to support Node.js 20.0-20.18.
 *
 * The jose library is ESM-only and cannot be loaded via require() in Node.js versions
 * before 20.19.0. This wrapper uses dynamic import() which works in both ESM and CJS
 * across all Node.js 20+ versions.
 *
 * This workaround can be removed when Node.js 20 reaches end-of-life (April 2026),
 * at which point we can bump to Node.js 22+ and use direct imports.
 *
 * @returns Promise that resolves to the jose module
 */
export function getJose() {
  return (_josePromise ??= import('jose'));
}
