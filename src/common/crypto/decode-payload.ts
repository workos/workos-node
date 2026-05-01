export type WebhookPayload =
  | string
  | Uint8Array
  | ArrayBuffer
  | Record<string, unknown>;

// Decodes raw byte payloads to a UTF-8 string without stripping a BOM prefix.
// Used by both signature verification (HMAC input) and post-verification
// parsing (JSON.parse input) to guarantee the same bytes are signed and parsed.
export function decodePayloadToString(payload: WebhookPayload): string {
  if (typeof payload === 'string') {
    return payload;
  }
  if (payload instanceof ArrayBuffer) {
    return new TextDecoder('utf-8', { ignoreBOM: true }).decode(
      new Uint8Array(payload),
    );
  }
  if (payload instanceof Uint8Array) {
    return new TextDecoder('utf-8', { ignoreBOM: true }).decode(payload);
  }
  return JSON.stringify(payload);
}
