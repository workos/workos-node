import { PKCE, PKCEPair } from './pkce';

describe('PKCE', () => {
  let pkce: PKCE;

  beforeEach(() => {
    pkce = new PKCE();
  });

  describe('generateCodeVerifier', () => {
    it('generates a string of default length (43)', () => {
      const verifier = pkce.generateCodeVerifier();
      expect(verifier).toHaveLength(43);
    });

    it('generates a string of custom length', () => {
      const verifier = pkce.generateCodeVerifier(128);
      expect(verifier).toHaveLength(128);
    });

    it('generates only RFC 7636 compliant characters', () => {
      const verifier = pkce.generateCodeVerifier();
      // RFC 7636: unreserved characters are [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    });

    it('generates unique values', () => {
      const verifiers = new Set(
        Array.from({ length: 100 }, () => pkce.generateCodeVerifier()),
      );
      // All 100 should be unique
      expect(verifiers.size).toBe(100);
    });

    it('throws RangeError for length < 43', () => {
      expect(() => pkce.generateCodeVerifier(42)).toThrow(RangeError);
      expect(() => pkce.generateCodeVerifier(42)).toThrow(
        'Code verifier length must be between 43 and 128',
      );
    });

    it('throws RangeError for length > 128', () => {
      expect(() => pkce.generateCodeVerifier(129)).toThrow(RangeError);
      expect(() => pkce.generateCodeVerifier(129)).toThrow(
        'Code verifier length must be between 43 and 128',
      );
    });

    it('accepts minimum length (43)', () => {
      const verifier = pkce.generateCodeVerifier(43);
      expect(verifier).toHaveLength(43);
    });

    it('accepts maximum length (128)', () => {
      const verifier = pkce.generateCodeVerifier(128);
      expect(verifier).toHaveLength(128);
    });
  });

  describe('generateCodeChallenge', () => {
    it('generates base64url-encoded SHA-256 hash', async () => {
      const verifier = 'test_verifier_with_exactly_43_characters_xx';
      const challenge = await pkce.generateCodeChallenge(verifier);

      // Challenge should be base64url encoded (no +, /, or = padding)
      expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
    });

    it('produces consistent output for same input', async () => {
      const verifier = 'consistent_test_verifier_exactly_43_chars_';
      const challenge1 = await pkce.generateCodeChallenge(verifier);
      const challenge2 = await pkce.generateCodeChallenge(verifier);

      expect(challenge1).toBe(challenge2);
    });

    it('produces different output for different input', async () => {
      const verifier1 = 'first_test_verifier_exactly_43_characters_';
      const verifier2 = 'second_test_verifier_exactly_43_character_';

      const challenge1 = await pkce.generateCodeChallenge(verifier1);
      const challenge2 = await pkce.generateCodeChallenge(verifier2);

      expect(challenge1).not.toBe(challenge2);
    });

    it('produces correct SHA-256 hash for known input', async () => {
      // Using a well-known test vector
      // The verifier "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk" should produce
      // the challenge "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM" (from RFC 7636 Appendix B)
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const expectedChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

      const challenge = await pkce.generateCodeChallenge(verifier);
      expect(challenge).toBe(expectedChallenge);
    });
  });

  describe('generate', () => {
    it('returns a PKCEPair with all required fields', async () => {
      const pair = await pkce.generate();

      expect(pair).toHaveProperty('codeVerifier');
      expect(pair).toHaveProperty('codeChallenge');
      expect(pair).toHaveProperty('codeChallengeMethod');
    });

    it('returns S256 as the challenge method', async () => {
      const pair = await pkce.generate();
      expect(pair.codeChallengeMethod).toBe('S256');
    });

    it('generates valid verifier', async () => {
      const pair = await pkce.generate();

      expect(pair.codeVerifier).toHaveLength(43);
      expect(pair.codeVerifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    });

    it('generates matching challenge for verifier', async () => {
      const pair = await pkce.generate();

      // Verify the challenge matches what we'd generate from the verifier
      const expectedChallenge = await pkce.generateCodeChallenge(
        pair.codeVerifier,
      );
      expect(pair.codeChallenge).toBe(expectedChallenge);
    });

    it('generates unique pairs', async () => {
      const pairs = await Promise.all(
        Array.from({ length: 10 }, () => pkce.generate()),
      );

      const verifiers = new Set(pairs.map((p) => p.codeVerifier));
      const challenges = new Set(pairs.map((p) => p.codeChallenge));

      expect(verifiers.size).toBe(10);
      expect(challenges.size).toBe(10);
    });
  });

  describe('PKCEPair type', () => {
    it('has correct shape', async () => {
      const pair: PKCEPair = await pkce.generate();

      // TypeScript compilation would fail if these types are wrong
      const _verifier: string = pair.codeVerifier;
      const _challenge: string = pair.codeChallenge;
      const _method: 'S256' = pair.codeChallengeMethod;

      expect(_verifier).toBeDefined();
      expect(_challenge).toBeDefined();
      expect(_method).toBe('S256');
    });
  });
});
