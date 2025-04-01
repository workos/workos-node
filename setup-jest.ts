import { enableFetchMocks } from 'jest-fetch-mock';
import { Crypto } from '@peculiar/webcrypto';

enableFetchMocks();

// Assign Node's Crypto to global.crypto if it is not already present
if (!global.crypto) {
  global.crypto = new Crypto();
}
