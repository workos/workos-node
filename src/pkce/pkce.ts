export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0 public clients.
 *
 * Implements RFC 7636 for secure authorization code exchange without a client secret.
 * Used by Electron apps, React Native/mobile apps, CLI tools, and other public clients.
 */
export class PKCE {
  /**
   * Generate a cryptographically random code verifier.
   *
   * The verifier uses unreserved URI characters per RFC 7636:
   * [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
   *
   * @param length - Length of verifier (43-128, default 43)
   * @returns RFC 7636 compliant code verifier
   * @throws RangeError if length is outside valid range
   */
  generateCodeVerifier(length: number = 43): string {
    if (length < 43 || length > 128) {
      throw new RangeError(
        `Code verifier length must be between 43 and 128, got ${length}`,
      );
    }

    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues, (v) => charset[v % charset.length]).join(
      '',
    );
  }

  /**
   * Generate S256 code challenge from a verifier.
   *
   * Computes SHA-256 hash of the verifier and returns it as a base64url-encoded string.
   *
   * @param verifier - The code verifier
   * @returns Base64URL-encoded SHA256 hash
   */
  async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(hash));
  }

  /**
   * Generate a complete PKCE pair (verifier + challenge).
   *
   * This is the recommended method for most use cases. It generates both
   * the code verifier and its corresponding challenge in one call.
   *
   * @returns Code verifier, challenge, and method ('S256')
   */
  async generate(): Promise<PKCEPair> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    return { codeVerifier, codeChallenge, codeChallengeMethod: 'S256' };
  }

  /**
   * Encode a Uint8Array to base64url format.
   *
   * Base64url encoding replaces '+' with '-', '/' with '_', and removes padding.
   */
  private base64UrlEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
