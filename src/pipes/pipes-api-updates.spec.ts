// @oagen-ignore-file
// Contracts added after the initial connection-sharing generation.
import fetch from 'jest-fetch-mock';
import { WorkOS } from '../workos';
import {
  fetchBody,
  fetchHeaders,
  fetchMethod,
  fetchOnce,
  fetchSearchParams,
  fetchURL,
} from '../common/utils/test-utils';
import connectedAccountFixture from './fixtures/connected-account.json';
import providersFixture from './fixtures/data-integrations-list-response.json';

const workos = new WorkOS('sk_test_example');
const config = { account: 'acme', subdomain: 'support' };
const owner = {
  userId: 'user_123',
  organizationId: 'org_123',
  connectionOwner: 'organization' as const,
};
const wireOwner = {
  user_id: 'user_123',
  organization_id: 'org_123',
  connection_owner: 'organization',
};

beforeEach(() => fetch.resetMocks());

describe('Pipes provider config', () => {
  it.each(['oauth', 'api_key', 'client_credentials'] as const)(
    'returns vended config for %s without conflating it with token metadata',
    async (authMethod) => {
      const metadata = { instance_url: 'https://token.example.test' };
      fetchOnce({
        active: true,
        credential: {
          object: 'credential',
          auth_method: authMethod,
          value: 'test_secret',
          config,
          ...(authMethod !== 'api_key' && {
            expires_at: null,
            scopes: ['read'],
            missing_scopes: [],
          }),
          ...(authMethod === 'client_credentials' && { metadata }),
        },
      });
      const result = await workos.pipes.createDataIntegrationCredential({
        slug: 'provider',
        ...owner,
      });
      const receivedConfig: Record<string, string> | undefined =
        result.credential?.config;
      expect(receivedConfig).toEqual(config);
      expect(result.credential?.metadata).toEqual(
        authMethod === 'client_credentials' ? metadata : undefined,
      );
    },
  );

  it.each([{}, undefined])(
    'preserves empty versus absent vended config: %j',
    async (responseConfig) => {
      fetchOnce({
        active: true,
        credential: {
          object: 'credential',
          auth_method: 'api_key',
          value: 'key',
          config: responseConfig,
        },
      });
      const result = await workos.pipes.createDataIntegrationCredential({
        slug: 'provider',
        ...owner,
      });
      expect(result.credential?.config).toEqual(responseConfig);
    },
  );

  describe.each(['oauth', 'api_key', 'client_credentials'] as const)(
    '%s connected accounts',
    (authMethod) => {
      it.each([
        'getUserConnectedAccount',
        'getOrganizationConnectedAccount',
        'listUserDataProviders',
        'listOrganizationDataProviders',
      ] as const)('%s retains connection config', async (method) => {
        const account = {
          ...connectedAccountFixture,
          auth_method: authMethod,
          config,
        };
        fetchOnce(
          method.startsWith('list')
            ? {
                object: 'list',
                data: [
                  {
                    ...providersFixture.data[0],
                    connected_account: account,
                    connected_accounts: [account],
                  },
                ],
              }
            : account,
        );
        const options = {
          userId: 'user_123',
          organizationId: 'org_123',
          slug: 'provider',
          supportsMultipleConnections: true,
        };
        const result = await workos.pipes[method](options);
        if (result.object === 'list') {
          expect(result.data[0].connectedAccount?.config).toEqual(config);
          expect(result.data[0].connectedAccounts?.[0].config).toEqual(config);
        } else {
          expect(result.config).toEqual(config);
        }
      });
    },
  );
});

describe('Pipes explicit connection creation', () => {
  it('creates an API-key connection with POST and explicit add intent', async () => {
    fetchOnce(connectedAccountFixture);
    const result = await workos.pipes.createDataIntegrationApiKey({
      slug: 'provider/slug',
      ...owner,
      secret: 'test_key',
      connectionIntent: 'add',
    });
    expect(fetchMethod()).toBe('POST');
    expect(new URL(String(fetchURL())).pathname).toBe(
      '/data-integrations/provider%2Fslug/api-key',
    );
    expect(fetchBody()).toEqual({
      ...wireOwner,
      secret: 'test_key',
      connection_intent: 'add',
    });
    expect(fetchHeaders()).toHaveProperty(
      'Idempotency-Key',
      expect.stringMatching(/^retry-/),
    );
    expect(result.id).toBe(connectedAccountFixture.id);
  });

  it('creates a client-credentials connection with POST and installation config', async () => {
    fetchOnce(connectedAccountFixture);
    await workos.pipes.createDataIntegrationClientCredential({
      slug: 'provider/slug',
      ...owner,
      clientId: 'client',
      clientSecret: 'secret',
      config,
      connectionIntent: 'add',
    });
    expect(fetchMethod()).toBe('POST');
    expect(new URL(String(fetchURL())).pathname).toBe(
      '/data-integrations/provider%2Fslug/client-credentials',
    );
    expect(fetchBody()).toEqual({
      ...wireOwner,
      client_id: 'client',
      client_secret: 'secret',
      config,
      connection_intent: 'add',
    });
    expect(fetchHeaders()).toHaveProperty(
      'Idempotency-Key',
      expect.stringMatching(/^retry-/),
    );
  });

  it('propagates the creation rollout error without falling back to a PUT', async () => {
    fetchOnce(
      {
        code: 'multiple_connections_unavailable',
        message: 'Additional connections are not yet available.',
      },
      { status: 404 },
    );
    await expect(
      workos.pipes.createDataIntegrationApiKey({
        slug: 'provider',
        userId: 'user_123',
        secret: 'test_key',
        connectionIntent: 'add',
      }),
    ).rejects.toMatchObject({
      status: 404,
      code: 'multiple_connections_unavailable',
    });
    expect(fetch.mock.calls).toHaveLength(1);
    expect(fetchMethod()).toBe('POST');
  });

  it.each([
    'createUserConnectedAccount',
    'createOrganizationConnectedAccount',
  ] as const)('%s sends add intent in the import body', async (method) => {
    fetchOnce(connectedAccountFixture);
    await workos.pipes[method]({
      slug: 'provider',
      userId: 'user_123',
      organizationId: 'org_123',
      accessToken: 'token',
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
      connectionIntent: 'add',
    });
    expect(fetchMethod()).toBe('POST');
    expect(fetchBody()).toEqual({
      access_token: 'token',
      expires_at: '2026-12-31T00:00:00.000Z',
      connection_intent: 'add',
      ...(method === 'createOrganizationConnectedAccount' && {
        user_id: 'user_123',
      }),
    });
    expect(fetchSearchParams()).toEqual(
      method === 'createUserConnectedAccount'
        ? { organization_id: 'org_123' }
        : {},
    );
  });
});

describe('Pipes exact reauthorization', () => {
  it('retains snake_case serialization for API-key PUT requests', async () => {
    fetchOnce(connectedAccountFixture);
    await workos.pipes.updateDataIntegrationApiKey({
      slug: 'provider',
      ...owner,
      secret: 'test_key',
      connectedAccountId: 'account_123',
      connectionIntent: 'reauthorize',
    });
    expect(fetchMethod()).toBe('PUT');
    expect(fetchBody()).toEqual({
      ...wireOwner,
      secret: 'test_key',
      connected_account_id: 'account_123',
      connection_intent: 'reauthorize',
    });
  });

  it('retains snake_case serialization for client-credentials PUT requests', async () => {
    fetchOnce(connectedAccountFixture);
    await workos.pipes.updateDataIntegrationClientCredentials({
      slug: 'provider',
      ...owner,
      clientId: 'client',
      clientSecret: 'secret',
      config,
      connectedAccountId: 'account_123',
      connectionIntent: 'reauthorize',
    });
    expect(fetchMethod()).toBe('PUT');
    expect(fetchBody()).toEqual({
      ...wireOwner,
      client_id: 'client',
      client_secret: 'secret',
      config,
      connected_account_id: 'account_123',
      connection_intent: 'reauthorize',
    });
  });

  it.each([
    'updateUserConnectedAccount',
    'updateOrganizationConnectedAccount',
  ] as const)(
    '%s sends reauthorization intent in the query, not the body',
    async (method) => {
      fetchOnce(connectedAccountFixture);
      await workos.pipes[method]({
        slug: 'provider',
        userId: 'user_123',
        organizationId: 'org_123',
        accessToken: 'new_token',
        connectedAccountId: 'account_123',
        connectionIntent: 'reauthorize',
        supportsMultipleConnections: false,
      });
      expect(fetchMethod()).toBe('PUT');
      expect(fetchSearchParams()).toEqual({
        connected_account_id: 'account_123',
        connection_intent: 'reauthorize',
        supports_multiple_connections: 'false',
        ...(method === 'updateUserConnectedAccount' && {
          organization_id: 'org_123',
        }),
      });
      expect(fetchBody()).toEqual({
        access_token: 'new_token',
        ...(method === 'updateOrganizationConnectedAccount' && {
          user_id: 'user_123',
        }),
      });
    },
  );
});
