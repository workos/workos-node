import { webcrypto } from 'crypto';

// jest-fetch-mock replaces the global fetch the moment it is loaded. Keep the
// runtime's own implementation reachable for tests that need real HTTP
// streaming and abort behaviour (see fetch-client.spec.ts).
const NATIVE_FETCH_KEY = '__workosNativeFetch';
(globalThis as Record<string, unknown>)[NATIVE_FETCH_KEY] = globalThis.fetch;

const { enableFetchMocks } = require('jest-fetch-mock');

enableFetchMocks();

// Make Node's crypto.webcrypto available as global.crypto for tests
if (!global.crypto) {
  global.crypto = webcrypto as unknown as Crypto;
}
