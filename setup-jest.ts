import { enableFetchMocks } from 'jest-fetch-mock';
import { webcrypto } from 'crypto';

enableFetchMocks();

// Make Node's crypto.webcrypto available as global.crypto for tests
if (!global.crypto) {
  global.crypto = webcrypto as unknown as Crypto;
}
