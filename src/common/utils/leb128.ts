/**
 * LEB128 (Little Endian Base 128) encoding/decoding for unsigned 32-bit integers.
 *
 * This is a variable-length integer encoding where each byte stores 7 bits of data
 * and uses bit 7 as a continuation flag (1 = more bytes follow, 0 = last byte).
 *
 * Benefits:
 * - Small values use fewer bytes (e.g., 0-127 use only 1 byte)
 * - Works in all JavaScript runtimes (uses only Uint8Array)
 * - No dependencies on Node.js Buffer or other runtime-specific APIs
 */

const MAX_UINT32 = 0xffffffff;
const CONTINUATION_BIT = 0x80;
const DATA_BITS_MASK = 0x7f;
const DATA_BITS_PER_BYTE = 7;
const MAX_BYTES_FOR_UINT32 = 5; // ceil(32 / 7) = 5

/**
 * Encodes an unsigned 32-bit integer into LEB128 format.
 *
 * @param value - The unsigned 32-bit integer to encode (0 to 4,294,967,295)
 * @returns Uint8Array containing the encoded bytes (1-5 bytes)
 * @throws Error if value is invalid
 *
 * @example
 * encodeUInt32(0) // Uint8Array[0x00] (1 byte)
 * encodeUInt32(127) // Uint8Array[0x7F] (1 byte)
 * encodeUInt32(128) // Uint8Array[0x80, 0x01] (2 bytes)
 * encodeUInt32(300) // Uint8Array[0xAC, 0x02] (2 bytes)
 */
export function encodeUInt32(value: number): Uint8Array {
  validateUInt32(value);

  // Handle zero directly (most common small value)
  if (value === 0) {
    return new Uint8Array([0]);
  }

  const bytes: number[] = [];

  do {
    let byte = value & DATA_BITS_MASK;
    value >>>= DATA_BITS_PER_BYTE;

    if (value !== 0) {
      byte |= CONTINUATION_BIT;
    }

    bytes.push(byte);
  } while (value !== 0);

  return new Uint8Array(bytes);
}

/**
 * Decodes an unsigned 32-bit integer from LEB128 format.
 *
 * @param data - Uint8Array containing LEB128 encoded data
 * @param offset - Starting position in the buffer (defaults to 0)
 * @returns Object with decoded value and the index after the last byte read
 * @throws Error if decoding fails
 *
 * @example
 * decodeUInt32(new Uint8Array([0x00])) // { value: 0, nextIndex: 1 }
 * decodeUInt32(new Uint8Array([0x7F])) // { value: 127, nextIndex: 1 }
 * decodeUInt32(new Uint8Array([0x80, 0x01])) // { value: 128, nextIndex: 2 }
 * decodeUInt32(new Uint8Array([0xAC, 0x02])) // { value: 300, nextIndex: 2 }
 */
export function decodeUInt32(
  data: Uint8Array,
  offset = 0,
): { value: number; nextIndex: number } {
  validateOffset(data, offset);

  let result = 0;
  let shift = 0;
  let index = offset;
  let bytesRead = 0;

  while (index < data.length) {
    const byte = data[index++];
    bytesRead++;

    // Check for overflow before processing
    if (bytesRead > MAX_BYTES_FOR_UINT32) {
      throw new Error('LEB128 sequence exceeds maximum length for uint32');
    }

    result |= (byte & DATA_BITS_MASK) << shift;

    if (!hasContinuationBit(byte)) {
      // Convert to unsigned 32-bit integer
      return { value: result >>> 0, nextIndex: index };
    }

    shift += DATA_BITS_PER_BYTE;
  }

  throw new Error('Truncated LEB128 encoding');
}

/**
 * Validates that a value is a valid unsigned 32-bit integer.
 */
function validateUInt32(value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error('Value must be a finite number');
  }
  if (!Number.isInteger(value)) {
    throw new Error('Value must be an integer');
  }
  if (value < 0) {
    throw new Error('Value must be non-negative');
  }
  if (value > MAX_UINT32) {
    throw new Error(`Value must not exceed ${MAX_UINT32} (MAX_UINT32)`);
  }
}

/**
 * Validates that an offset is within bounds.
 */
function validateOffset(data: Uint8Array, offset: number): void {
  if (offset < 0 || offset >= data.length) {
    throw new Error(`Offset ${offset} is out of bounds (buffer length: ${data.length})`);
  }
}

/**
 * Checks if a byte has the continuation bit set.
 */
function hasContinuationBit(byte: number): boolean {
  return (byte & CONTINUATION_BIT) !== 0;
}