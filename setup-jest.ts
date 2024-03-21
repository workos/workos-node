import { enableFetchMocks } from 'jest-fetch-mock';
import { Crypto } from '@peculiar/webcrypto';

enableFetchMocks();

if (global.crypto === undefined) {
  global.crypto = new Crypto();
}
