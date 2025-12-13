import { sealData, unsealData } from './seal';

describe('seal', () => {
  const password = 'test-password-at-least-32-characters-long';

  describe('sealData', () => {
    it('seals data and appends version delimiter', async () => {
      const data = { foo: 'bar' };
      const sealed = await sealData(data, { password });

      expect(sealed).toContain('~2');
      expect(sealed.startsWith('Fe26.2*')).toBe(true);
    });

    it('seals with TTL', async () => {
      const data = { foo: 'bar' };
      const sealed = await sealData(data, { password, ttl: 3600 });

      expect(sealed).toContain('~2');
    });
  });

  describe('unsealData', () => {
    it('round-trips seal/unseal', async () => {
      const data = { userId: '123', email: 'test@example.com' };
      const sealed = await sealData(data, { password });
      const unsealed = await unsealData<typeof data>(sealed, { password });

      expect(unsealed).toEqual(data);
    });

    it('round-trips complex nested data', async () => {
      const data = {
        user: { id: '123', name: 'Test' },
        roles: ['admin', 'user'],
        metadata: { nested: { deep: true } },
      };
      const sealed = await sealData(data, { password });
      const unsealed = await unsealData<typeof data>(sealed, { password });

      expect(unsealed).toEqual(data);
    });

    it('handles seals with TTL (expiration embedded in seal)', async () => {
      const data = { foo: 'bar' };
      // Seal with TTL - expiration timestamp is embedded in the seal
      const sealed = await sealData(data, { password, ttl: 3600 });

      // Verify expiration field is present (5th component, non-empty)
      const parts = sealed.split('~')[0].split('*');
      expect(parts[5]).toMatch(/^\d+$/); // Non-empty expiration timestamp

      // Should unseal successfully within TTL window
      const unsealed = await unsealData(sealed, { password });
      expect(unsealed).toEqual(data);
    });

    it('returns empty object for bad password', async () => {
      const data = { foo: 'bar' };
      const sealed = await sealData(data, { password });
      const unsealed = await unsealData(sealed, {
        password: 'wrong-password-at-least-32-characters',
      });

      expect(unsealed).toEqual({});
    });

    it('returns empty object for tampered seal', async () => {
      const data = { foo: 'bar' };
      const sealed = await sealData(data, { password });
      // Tamper with the sealed data
      const tampered = sealed.replace('Fe26.2', 'Fe26.2tampered');
      const unsealed = await unsealData(tampered, { password });

      expect(unsealed).toEqual({});
    });

    it('handles legacy tokens with persistent field (version 1)', async () => {
      // Manually construct a v1-style token that would have persistent wrapper
      const data = { persistent: { userId: '123' } };
      const sealed = await sealData(data, { password });
      // Replace ~2 with ~1 to simulate v1 token
      const v1Sealed = sealed.replace('~2', '~1');

      const unsealed = await unsealData<{ userId: string }>(v1Sealed, {
        password,
      });
      expect(unsealed).toEqual({ userId: '123' });
    });

    it('handles tokens without version delimiter', async () => {
      const data = { foo: 'bar' };
      const sealed = await sealData(data, { password });
      // Remove version delimiter to simulate pre-versioned token
      const noVersion = sealed.split('~')[0];

      const unsealed = await unsealData<typeof data>(noVersion, { password });
      expect(unsealed).toEqual(data);
    });
  });

  describe('iron-session compatibility', () => {
    // This test verifies that tokens sealed with this implementation
    // produce the same format as iron-session (Fe26.2 prefix with ~2 suffix)
    it('produces iron-session compatible format', async () => {
      const data = { userId: '123' };
      const sealed = await sealData(data, { password });

      // Verify format: Fe26.2*...*~2
      const parts = sealed.split('~');
      expect(parts).toHaveLength(2);
      expect(parts[1]).toBe('2');

      const ironPart = parts[0];
      expect(ironPart.startsWith('Fe26.2*')).toBe(true);

      // Iron format has 8 asterisk-delimited components
      const components = ironPart.split('*');
      expect(components).toHaveLength(8);
      expect(components[0]).toBe('Fe26.2');
    });

    // Verify that tokens can be round-tripped and maintain the expected format
    // This ensures compatibility with iron-session which uses the same Fe26.2 format
    it('can unseal self-generated tokens (simulates iron-session compatibility)', async () => {
      const data = { userId: '123', email: 'test@example.com' };
      const sealed = await sealData(data, { password });

      // Verify the format matches iron-session's expected output
      expect(sealed).toMatch(/^Fe26\.2\*1\*[^*]+\*[^*]+\*[^*]+\*\*[^*]+\*[^*]+~2$/);

      const unsealed = await unsealData<typeof data>(sealed, { password });
      expect(unsealed).toEqual(data);
    });
  });
});
