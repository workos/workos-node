/**
 * Cross-runtime compatible base64 encoding/decoding utilities
 * that work in both Node.js and browser environments
 */

/**
 * Converts a base64 string to a Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // In browsers and modern Node.js
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  // Node.js fallback using Buffer
  else if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  // Fallback implementation if neither is available
  else {
    throw new Error('No base64 decoding implementation available');
  }
}

/**
 * Converts a Uint8Array to a base64 string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  // In browsers and modern Node.js
  if (typeof btoa === 'function') {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  // Node.js fallback using Buffer
  else if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  // Fallback implementation if neither is available
  else {
    throw new Error('No base64 encoding implementation available');
  }
}
