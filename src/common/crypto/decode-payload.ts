export type WebhookPayload =
  | string
  | Uint8Array
  | ArrayBuffer
  | Record<string, unknown>;

// Realm-agnostic check for binary payloads. `instanceof` fails when the
// value originates from a different JS realm (Workers, iframes, VM contexts).
export function isBinaryPayload(payload: WebhookPayload): boolean {
  return (
    ArrayBuffer.isView(payload) ||
    Object.prototype.toString.call(payload) === '[object ArrayBuffer]'
  );
}

// Decodes raw byte payloads to a UTF-8 string without stripping a BOM prefix.
// Used by both signature verification (HMAC input) and post-verification
// parsing (JSON.parse input) to guarantee the same bytes are signed and parsed.
export function decodePayloadToString(payload: WebhookPayload): string {
  if (typeof payload === 'string') {
    return payload;
  }
  if (isBinaryPayload(payload)) {
    const bytes =
      Object.prototype.toString.call(payload) === '[object ArrayBuffer]'
        ? new Uint8Array(payload as ArrayBuffer)
        : (payload as Uint8Array);
    return new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes);
  }
  return JSON.stringify(payload);
}
