// @oagen-ignore-file
import type { IdentityTokenProvider } from './workload-identity-credentials';

type FileSystem = typeof import('node:fs/promises');

/**
 * The runtime's file system module, reached without an `import`.
 *
 * The Node entry is also what a browser bundler resolves for a public client,
 * so a static `node:` import would break that build, and webpack cannot load
 * a computed `import()`. `process.getBuiltinModule` is plain property access:
 * no bundler traces or rewrites it. Node.js 22.3 and later, Deno and Bun all
 * have it.
 */
function fileSystem(): FileSystem {
  const fs =
    typeof process !== 'undefined' &&
    typeof process.getBuiltinModule === 'function'
      ? (process.getBuiltinModule('node:fs/promises') as FileSystem | undefined)
      : undefined;

  if (!fs) {
    throw new Error('This runtime has no file system.');
  }

  return fs;
}

/**
 * An identity token provider that reads the token from a file on every call,
 * so a rotated token is picked up by the next exchange. Surrounding
 * whitespace is trimmed.
 *
 * Needs a file system, so it is exported from the Node entry only and not
 * from `@workos-inc/node/worker`.
 *
 * @example
 * new WorkloadIdentityCredentials({
 *   identityTokenProvider: tokenFile('/var/run/secrets/tokens/workos'),
 * });
 */
export function tokenFile(path: string): IdentityTokenProvider {
  return async () => {
    let contents: string;

    try {
      contents = await fileSystem().readFile(path, 'utf8');
    } catch (error) {
      throw new Error(`The identity token file ${path} could not be read.`, {
        cause: error,
      });
    }

    const token = contents.trim();

    if (!token) {
      throw new Error(`The identity token file ${path} is empty.`);
    }

    return token;
  };
}
