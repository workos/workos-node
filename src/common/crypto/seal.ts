import {
  seal as ironSeal,
  unseal as ironUnseal,
  defaults,
} from 'iron-webcrypto';

const VERSION_DELIMITER = '~';
const CURRENT_MAJOR_VERSION = 2;

interface SealOptions {
  password: string;
  ttl?: number;
}

interface UnsealOptions {
  password: string;
  ttl?: number;
}

function parseSeal(seal: string): {
  sealWithoutVersion: string;
  tokenVersion: number | null;
} {
  const [sealWithoutVersion = '', tokenVersionAsString] =
    seal.split(VERSION_DELIMITER);
  const tokenVersion =
    tokenVersionAsString == null ? null : parseInt(tokenVersionAsString, 10);
  return { sealWithoutVersion, tokenVersion };
}

export async function sealData(
  data: unknown,
  { password, ttl = 0 }: SealOptions,
): Promise<string> {
  const passwordObj = {
    id: '1',
    secret: password,
  };

  const seal = await ironSeal(data, passwordObj, {
    ...defaults,
    ttl: ttl * 1000,
    encode: JSON.stringify,
  });

  return `${seal}${VERSION_DELIMITER}${CURRENT_MAJOR_VERSION}`;
}

export async function unsealData<T = unknown>(
  encryptedData: string,
  { password, ttl = 0 }: UnsealOptions,
): Promise<T> {
  const { sealWithoutVersion, tokenVersion } = parseSeal(encryptedData);

  const passwordMap = { 1: password };

  let data: unknown;
  try {
    data =
      (await ironUnseal(sealWithoutVersion, passwordMap, {
        ...defaults,
        ttl: ttl * 1000,
      })) ?? {};
  } catch (error) {
    if (
      error instanceof Error &&
      /^(Expired seal|Bad hmac value|Cannot find password|Incorrect number of sealed components)/.test(
        error.message,
      )
    ) {
      return {} as T;
    }
    throw error;
  }

  if (tokenVersion === 2) {
    return data as T;
  } else if (tokenVersion !== null) {
    const record = data as Record<string, unknown>;
    return (record.persistent ?? data) as T;
  }

  return data as T;
}
