import { enableFetchMocks } from 'jest-fetch-mock';
import { Crypto } from '@peculiar/webcrypto';
import { WorkOS } from './src/workos';
import { WebIronSessionProvider } from './src/common/iron-session/web-iron-session-provider';

enableFetchMocks();

// Assign Node's Crypto to global.crypto if it is not already present
if (!global.crypto) {
  global.crypto = new Crypto();
}

// For tests, we can use the WebIronSessionProvider
WorkOS.prototype.createIronSessionProvider = jest
  .fn()
  .mockReturnValue(new WebIronSessionProvider());
