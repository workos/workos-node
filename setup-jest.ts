import { enableFetchMocks } from 'jest-fetch-mock';
import { Crypto } from '@peculiar/webcrypto';

enableFetchMocks();

global.crypto = new Crypto();
