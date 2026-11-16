import { webcrypto } from 'crypto';

// jest-fetch-mock replaces the global fetch the moment it is loaded. Keep the
// runtime's own implementation reachable for tests that need real HTTP
// streaming and abort behavior (see fetch-client.spec.ts).
const NATIVE_FETCH_KEY = '__workosNativeFetch';
(globalThis as Record<string, unknown>)[NATIVE_FETCH_KEY] = globalThis.fetch;

const { enableFetchMocks } = require('jest-fetch-mock');

enableFetchMocks();

// Make Node's crypto.webcrypto available as global.crypto for tests
if (!global.crypto) {
  global.crypto = webcrypto as unknown as Crypto;
}

// The client reads its API host from these variables when no option is passed.
// Clear them so a developer's shell can't point tests at another host.
delete process.env.WORKOS_API_HOSTNAME;
delete process.env.WORKOS_API_PORT;
delete process.env.WORKOS_API_HTTPS;
