/**
 * LEB128 (Little Endian Base 128) encoding for unsigned 32-bit integers.
 * Variable-length encoding: each byte stores 7 bits of data, bit 7 is continuation flag.
 */

const MAX_UINT32 = 0xffffffff;
const CONTINUATION_BIT = 0x80;
const DATA_BITS_MASK = 0x7f;
const DATA_BITS_PER_BYTE = 7;
const MAX_BYTES_FOR_UINT32 = 5;

/**
 * Encodes an unsigned 32-bit integer into LEB128 format.
 *
 * @param value - Unsigned 32-bit integer (0 to 4,294,967,295)
 * @returns Encoded bytes (1-5 bytes depending on value)
 */
export function encodeUInt32(value: number): Uint8Array {
  validateUInt32(value);

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
 * @param data - Buffer containing LEB128 encoded data
 * @param offset - Starting position in buffer (default: 0)
 * @returns Decoded value and index after last byte read
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

    if (bytesRead > MAX_BYTES_FOR_UINT32) {
      throw new Error('LEB128 sequence exceeds maximum length for uint32');
    }

    result |= (byte & DATA_BITS_MASK) << shift;

    if (!hasContinuationBit(byte)) {
      return { value: result >>> 0, nextIndex: index };
    }

    shift += DATA_BITS_PER_BYTE;
  }

  throw new Error('Truncated LEB128 encoding');
}

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

function validateOffset(data: Uint8Array, offset: number): void {
  if (offset < 0 || offset >= data.length) {
    throw new Error(
      `Offset ${offset} is out of bounds (buffer length: ${data.length})`,
    );
  }
}

function hasContinuationBit(byte: number): boolean {
  return (byte & CONTINUATION_BIT) !== 0;
}
