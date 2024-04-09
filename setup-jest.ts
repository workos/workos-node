import { enableFetchMocks } from 'jest-fetch-mock';
import { Crypto } from '@peculiar/webcrypto';

console.log("!!!!!!!\n\n\n\nEnabling fetch mocks!\n\n\n\n!!!!!!!");
console.log(enableFetchMocks);

enableFetchMocks();

// Assign Node's Crypto to global.crypto if it is not already present
if (!global.crypto) {
    global.crypto = new Crypto();
}
