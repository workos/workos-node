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

/**
 * Parse an iron-session seal to extract the version
 */
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

/**
 * Seal (encrypt) data in a format compatible with iron-session.
 *
 * @param data - The data to seal
 * @param options - Sealing options
 * @param options.password - Password for encryption (must be at least 32 characters)
 * @param options.ttl - Time to live in seconds (default: 0 = no expiration)
 * @returns The sealed string
 */
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
    ttl: ttl * 1000, // Convert seconds to milliseconds
    encode: JSON.stringify, // Preserve v1 lenient serialization
  });

  // Add the version delimiter exactly like iron-session does
  return `${seal}${VERSION_DELIMITER}${CURRENT_MAJOR_VERSION}`;
}

/**
 * Unseal (decrypt) data that was sealed with iron-session or sealData.
 *
 * @param encryptedData - The sealed string to decrypt
 * @param options - Unsealing options
 * @param options.password - Password for decryption
 * @param options.ttl - Time to live in seconds (default: 0 = no expiration check)
 * @returns The unsealed data, or empty object if unsealing fails
 */
export async function unsealData<T = unknown>(
  encryptedData: string,
  { password, ttl = 0 }: UnsealOptions,
): Promise<T> {
  const { sealWithoutVersion, tokenVersion } = parseSeal(encryptedData);

  // Format password as a map like iron-session expects
  const passwordMap = { 1: password };

  let data: unknown;
  try {
    data =
      (await ironUnseal(sealWithoutVersion, passwordMap, {
        ...defaults,
        ttl: ttl * 1000,
      })) ?? {};
  } catch (error) {
    // Match iron-session's behavior: return empty object for known errors
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

  // Handle token version for backwards compatibility
  if (tokenVersion === 2) {
    return data as T;
  } else if (tokenVersion !== null) {
    // For older token versions, extract the persistent property
    const record = data as Record<string, unknown>;
    return (record.persistent ?? data) as T;
  }

  return data as T;
}
