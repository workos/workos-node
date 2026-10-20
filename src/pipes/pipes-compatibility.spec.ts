// @oagen-ignore-file
// Preserve consumer-facing access patterns independently of generated tests.
import fetch from 'jest-fetch-mock';
import type {
  CreateDataIntegrationOptions,
  ConnectedAccountDto,
  DataIntegrationCredentialsDto,
  DataIntegrationCredentialsResponseCredential,
  DataIntegrationCredentialsResponseCredentialResponse,
  DataIntegrationVendedCredential,
  DataIntegrationVendedCredentialResponse,
} from '../index';
import {
  deserializeDataIntegrationAccessTokenResponse,
  deserializeDataIntegrationCredentialsResponseCredential,
  deserializeDataIntegrationVendedCredential,
  serializeConnectedAccountDto,
  serializeConnectedAccountInput,
  serializeDataIntegrationCredentialsDto,
  serializeDataIntegrationCredentialsInput,
} from './serializers';
import { fetchBody, fetchOnce } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import dataIntegrationFixture from './fixtures/data-integration.json';

// Check declaration merging without adding test-only fields to the SDK types.
declare module './interfaces/create-data-integration-options.interface' {
  interface CreateDataIntegrationOptions {
    provider: string;
  }
}

const workos = new WorkOS('sk_test_example');

beforeEach(() => fetch.resetMocks());

describe('Pipes source compatibility', () => {
  it('exports the access-token response deserializer', () => {
    expect(
      deserializeDataIntegrationAccessTokenResponse({
        active: false,
        error: 'not_installed',
      }),
    ).toEqual({ active: false, error: 'not_installed' });
  });

  it('preserves the connected-account DTO serializer as a compatibility alias', () => {
    const input: ConnectedAccountDto = {
      accessToken: 'test_token',
      refreshToken: 'test_refresh',
      expiresAt: new Date('2026-01-01T00:00:00.000Z'),
      scopes: ['repo'],
      state: 'connected',
    };
    expect(serializeConnectedAccountDto(input)).toEqual({
      access_token: 'test_token',
      refresh_token: 'test_refresh',
      expires_at: '2026-01-01T00:00:00.000Z',
      scopes: ['repo'],
      state: 'connected',
    });
    expect(serializeConnectedAccountDto).toBe(serializeConnectedAccountInput);
  });

  it('preserves the OAuth credentials DTO serializer as a compatibility alias', () => {
    const input: DataIntegrationCredentialsDto = {
      type: 'custom',
      clientId: 'test_client',
      clientSecret: 'test_secret',
    };
    expect(serializeDataIntegrationCredentialsDto(input)).toEqual({
      type: 'custom',
      client_id: 'test_client',
      client_secret: 'test_secret',
    });
    expect(serializeDataIntegrationCredentialsDto).toBe(
      serializeDataIntegrationCredentialsInput,
    );
  });

  it('keeps the create options interface mergeable', async () => {
    const options: CreateDataIntegrationOptions = { provider: 'github' };
    fetchOnce(dataIntegrationFixture);
    await workos.pipes.createDataIntegration(options);
    expect(fetchBody()).toEqual({ provider: 'github' });
  });

  it('preserves the legacy credential type and serializer exports', () => {
    const response: DataIntegrationCredentialsResponseCredentialResponse = {
      object: 'credential',
      auth_method: 'client_credentials',
      value: 'token',
      expires_at: null,
      scopes: ['api'],
      missing_scopes: [],
      metadata: { instance_url: 'https://example.test' },
    };
    const vendedResponse: DataIntegrationVendedCredentialResponse = response;
    const legacy: DataIntegrationCredentialsResponseCredential =
      deserializeDataIntegrationVendedCredential(vendedResponse);
    const vended: DataIntegrationVendedCredential =
      deserializeDataIntegrationCredentialsResponseCredential(response);
    const metadata: Record<string, unknown> | undefined = vended.metadata;

    expect(vended).toStrictEqual(legacy);
    expect(metadata).toEqual({ instance_url: 'https://example.test' });
    expect(deserializeDataIntegrationCredentialsResponseCredential).toBe(
      deserializeDataIntegrationVendedCredential,
    );
  });

  it.each([
    {
      response: {
        active: true,
        credential: {
          object: 'credential',
          auth_method: 'oauth',
          value: 'token',
          expires_at: null,
          scopes: ['repo'],
          missing_scopes: [],
        },
      },
      value: 'token',
      scopes: ['repo'],
      expiry: null,
      metadata: undefined,
    },
    {
      response: {
        active: true,
        credential: {
          object: 'credential',
          auth_method: 'api_key',
          value: 'secret',
        },
      },
      value: 'secret',
      scopes: undefined,
      expiry: undefined,
      metadata: undefined,
    },
    {
      response: {
        active: true,
        credential: {
          object: 'credential',
          auth_method: 'client_credentials',
          value: 'client_token',
          expires_at: null,
          scopes: ['api'],
          missing_scopes: [],
          metadata: { instance_url: 'https://example.test' },
        },
      },
      value: 'client_token',
      scopes: ['api'],
      expiry: null,
      metadata: { instance_url: 'https://example.test' },
    },
    {
      response: { active: false, error: 'not_installed' },
      value: 'not_installed',
      scopes: undefined,
      expiry: undefined,
      metadata: undefined,
    },
  ])(
    'allows legacy property access for $value',
    async ({ response, value, scopes, expiry, metadata }) => {
      fetchOnce(response);
      const result = await workos.pipes.createDataIntegrationCredential({
        slug: 'github',
        userId: 'user_123',
      });

      // These expressions must compile without checking active or authMethod.
      expect(result.credential?.value ?? result.error).toBe(value);
      expect(result.credential?.scopes).toEqual(scopes);
      expect(result.credential?.expiresAt).toBe(expiry);
      expect(result.credential?.metadata).toEqual(metadata);
    },
  );
});
