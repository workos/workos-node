// @oagen-ignore-file
// Request/response regressions that the generated smoke tests do not cover.
import fetch from 'jest-fetch-mock';
import type { DataIntegrationCredentialsResponse } from '../index';
import { WorkOS } from '../workos';
import {
  fetchBody,
  fetchOnce,
  fetchSearchParams,
  fetchURL,
} from '../common/utils/test-utils';
import connectedAccountFixture from './fixtures/connected-account.json';
import dataIntegrationFixture from './fixtures/data-integration.json';
import installationFixture from './fixtures/data-integration-installation.json';
import listDataIntegrationFixture from './fixtures/list-data-integration.json';
import providersFixture from './fixtures/data-integrations-list-response.json';

const workos = new WorkOS('sk_test_example');
const userId = 'user_123';
const organizationId = 'org_123';
const connectedAccountId = 'data_installation_123';
const apiKey = { userId, organizationId, secret: 'test_api_key' };
const serializedApiKey = {
  user_id: userId,
  organization_id: organizationId,
  secret: 'test_api_key',
};
const connectionOptions = {
  userId,
  organizationId,
  connectedAccountId,
  connectionOwner: 'organization' as const,
};
const serializedConnectionOptions = {
  user_id: userId,
  organization_id: organizationId,
  connected_account_id: connectedAccountId,
  connection_owner: 'organization',
};

beforeEach(() => fetch.resetMocks());

describe('Pipes request contracts', () => {
  it('preserves the ownership filter across automatic pagination', async () => {
    fetchOnce(listDataIntegrationFixture);
    fetchOnce({
      ...listDataIntegrationFixture,
      list_metadata: { before: null, after: 'next' },
    });
    fetchOnce(listDataIntegrationFixture);

    const list = await workos.pipes.listDataIntegrations({
      ownership: 'organization',
    });
    await list.autoPagination();

    expect(
      fetch.mock.calls.map(([url]) =>
        Object.fromEntries(new URL(String(url)).searchParams),
      ),
    ).toEqual([
      { ownership: 'organization', order: 'desc' },
      { ownership: 'organization', order: 'desc', limit: '100' },
      { ownership: 'organization', order: 'desc', limit: '100', after: 'next' },
    ]);
  });

  it('serializes integration ownership, auth methods, config, and OAuth credentials', async () => {
    fetchOnce(dataIntegrationFixture);
    await workos.pipes.createDataIntegration({
      provider: 'snowflake',
      ownership: 'organization',
      enabled: false,
      scopes: null,
      authMethods: ['oauth'],
      config: { account: 'acme' },
      credentials: {
        type: 'custom',
        clientId: 'client',
        clientSecret: 'secret',
      },
    });

    expect(fetchBody()).toEqual({
      provider: 'snowflake',
      ownership: 'organization',
      enabled: false,
      scopes: null,
      auth_methods: ['oauth'],
      config: { account: 'acme' },
      credentials: {
        type: 'custom',
        client_id: 'client',
        client_secret: 'secret',
      },
    });
  });

  it('does not invent auth methods or config when optional response fields are absent', async () => {
    const { auth_methods, config, installation, ...response } =
      dataIntegrationFixture;
    fetchOnce(response);
    const result = await workos.pipes.getDataIntegration({ slug: 'github' });
    expect(result.authMethods).toBeUndefined();
    expect(result.config).toBeUndefined();
    expect(result.installation).toBeNull();
  });

  it('creates an API-key integration and deserializes its initial installation', async () => {
    fetchOnce({
      ...dataIntegrationFixture,
      credentials: null,
      auth_methods: ['api_key'],
      installation: installationFixture,
    });
    const result = await workos.pipes.createDataIntegration({
      provider: 'custom-api',
      authMethods: ['api_key'],
      apiKey,
      customProvider: { name: 'Custom API' },
    });

    expect(fetchBody()).toEqual({
      provider: 'custom-api',
      auth_methods: ['api_key'],
      api_key: serializedApiKey,
      custom_provider: { name: 'Custom API' },
    });
    expect(result.credentials).toBeNull();
    expect(result.installation).toEqual({
      id: installationFixture.id,
      connectionRole: 'compatibility',
      accountIdentifier: 'workspace_123',
      accountDisplayName: 'Acme production',
      userId: installationFixture.user_id,
      organizationId: null,
      apiKeyLast4: 'cdef',
    });
  });

  it.each([
    'updateDataIntegration',
    'updateOrganizationDataIntegration',
  ] as const)(
    '%s serializes API-key rotation and explicit null/false values',
    async (method) => {
      fetchOnce({ ...dataIntegrationFixture, credentials: null });
      await workos.pipes[method]({
        slug: 'custom-api',
        apiKey,
        enabled: false,
        scopes: null,
      });
      expect(fetchBody()).toEqual({
        api_key: serializedApiKey,
        enabled: false,
        scopes: null,
      });
    },
  );

  it('authorizes an organization connection with installation config', async () => {
    fetchOnce({ url: 'https://provider.example/authorize' });
    await workos.pipes.authorizeDataIntegration({
      slug: 'zendesk',
      userId,
      organizationId,
      connectionOwner: 'organization',
      config: { subdomain: 'acme' },
      returnTo: 'https://example.com/callback',
    });
    expect(fetchBody()).toEqual({
      user_id: userId,
      organization_id: organizationId,
      connection_owner: 'organization',
      config: { subdomain: 'acme' },
      return_to: 'https://example.com/callback',
    });
  });

  it('selects an organization connection when rotating an API key', async () => {
    fetchOnce(connectedAccountFixture);
    await workos.pipes.updateDataIntegrationApiKey({
      slug: 'custom-api',
      ...connectionOptions,
      secret: 'test_secret',
    });
    expect(fetchBody()).toEqual({
      ...serializedConnectionOptions,
      secret: 'test_secret',
    });
  });

  it('serializes client credentials and deserializes their connection metadata', async () => {
    fetchOnce({
      ...connectedAccountFixture,
      auth_method: 'client_credentials',
      user_id: null,
      organization_id: organizationId,
    });
    const result = await workos.pipes.updateDataIntegrationClientCredentials({
      slug: 'salesforce',
      ...connectionOptions,
      clientId: 'client',
      clientSecret: 'secret',
      config: { salesforce_host: 'acme.my.salesforce.com' },
    });
    expect(fetchBody()).toEqual({
      ...serializedConnectionOptions,
      client_id: 'client',
      client_secret: 'secret',
      config: { salesforce_host: 'acme.my.salesforce.com' },
    });
    expect(result).toMatchObject({
      authMethod: 'client_credentials',
      userId: null,
      organizationId,
      clientId: connectedAccountFixture.client_id,
      clientSecretLast4: connectedAccountFixture.client_secret_last_4,
      config: connectedAccountFixture.config,
    });
  });

  it.each(['getAccessToken', 'createDataIntegrationCredential'] as const)(
    '%s sends ownership, connection selection, and explicit false',
    async (method) => {
      fetchOnce({ active: false, error: 'not_installed' });
      const result = await workos.pipes[method]({
        provider: 'github',
        slug: 'github',
        ...connectionOptions,
        supportsMultipleConnections: false,
      });
      expect(fetchBody()).toEqual({
        ...serializedConnectionOptions,
        supports_multiple_connections: false,
      });
      expect(result).toEqual({ active: false, error: 'not_installed' });
    },
  );

  describe.each([
    [
      'getUserConnectedAccount',
      '/user_management/users/user_123/connected_accounts/provider%2Fslug',
      { organization_id: organizationId },
    ],
    [
      'updateUserConnectedAccount',
      '/user_management/users/user_123/connected_accounts/provider%2Fslug',
      { organization_id: organizationId },
    ],
    [
      'deleteUserConnectedAccount',
      '/user_management/users/user_123/connected_accounts/provider%2Fslug',
      { organization_id: organizationId },
    ],
    [
      'getOrganizationConnectedAccount',
      '/organizations/org_123/connected_accounts/provider%2Fslug',
      {},
    ],
    [
      'updateOrganizationConnectedAccount',
      '/organizations/org_123/connected_accounts/provider%2Fslug',
      {},
    ],
    [
      'deleteOrganizationConnectedAccount',
      '/organizations/org_123/connected_accounts/provider%2Fslug',
      {},
    ],
  ] as const)('%s query parameters', (method, pathname, query) => {
    it.each([true, false, undefined])(
      'serializes supportsMultipleConnections=%s',
      async (supportsMultipleConnections) => {
        fetchOnce(connectedAccountFixture);
        await workos.pipes[method]({
          userId,
          organizationId,
          slug: 'provider/slug',
          supportsMultipleConnections,
          connectedAccountId,
        });
        expect(new URL(String(fetchURL())).pathname).toBe(pathname);
        expect(fetchSearchParams()).toEqual({
          ...query,
          connected_account_id: connectedAccountId,
          ...(supportsMultipleConnections !== undefined && {
            supports_multiple_connections: String(supportsMultipleConnections),
          }),
        });
      },
    );
  });

  it.each([
    'createUserConnectedAccount',
    'updateUserConnectedAccount',
    'createOrganizationConnectedAccount',
    'updateOrganizationConnectedAccount',
  ] as const)(
    '%s serializes tokens and dates without leaking path/query fields',
    async (method) => {
      fetchOnce(connectedAccountFixture);
      await workos.pipes[method]({
        userId,
        organizationId,
        slug: 'github',
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: new Date('2026-12-31T00:00:00.000Z'),
        scopes: ['repo'],
        state: 'connected',
      });
      expect(fetchBody()).toEqual({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: '2026-12-31T00:00:00.000Z',
        scopes: ['repo'],
        state: 'connected',
        ...(method.includes('Organization') && { user_id: userId }),
      });
    },
  );

  it.each(['listUserDataProviders', 'listOrganizationDataProviders'] as const)(
    '%s forwards plural opt-in and deserializes every connected account',
    async (method) => {
      fetchOnce(providersFixture);
      const result = await workos.pipes[method]({
        userId,
        organizationId,
        supportsMultipleConnections: true,
      });
      expect(fetchSearchParams()).toEqual({
        supports_multiple_connections: 'true',
        ...(method === 'listUserDataProviders' && {
          organization_id: organizationId,
        }),
      });
      expect(result.data[0].connectionOwner).toBe('user');
      expect(result.data[0].connectedAccounts).toEqual([
        result.data[0].connectedAccount,
      ]);
      expect(result.data[0].connectedAccounts?.[0]).toMatchObject({
        connectionRole: 'compatibility',
        accountIdentifier: 'workspace_123',
        accountDisplayName: 'Acme production',
      });
    },
  );

  it.each(['listUserDataProviders', 'listOrganizationDataProviders'] as const)(
    '%s keeps standard connections alongside the compatibility connection',
    async (method) => {
      const [provider] = providersFixture.data;
      const compatibilityAccount = provider.connected_account;
      const standardAccount = {
        ...compatibilityAccount,
        id: 'data_installation_standard',
        connection_role: 'standard',
        account_identifier: 'workspace_456',
        account_display_name: 'Acme staging',
      };
      fetchOnce({
        ...providersFixture,
        data: [
          {
            ...provider,
            connected_accounts: [compatibilityAccount, standardAccount],
          },
          {
            ...provider,
            id: 'data_integration_standard_only',
            connected_account: null,
            connected_accounts: [standardAccount],
          },
        ],
      });

      const result = await workos.pipes[method]({
        userId,
        organizationId,
        supportsMultipleConnections: true,
      });

      const [withPeers, standardOnly] = result.data;
      expect(withPeers.connectedAccount?.id).toBe(compatibilityAccount.id);
      expect(
        withPeers.connectedAccounts?.map(
          ({ id, connectionRole, accountIdentifier }) => ({
            id,
            connectionRole,
            accountIdentifier,
          }),
        ),
      ).toEqual([
        {
          id: compatibilityAccount.id,
          connectionRole: 'compatibility',
          accountIdentifier: 'workspace_123',
        },
        {
          id: 'data_installation_standard',
          connectionRole: 'standard',
          accountIdentifier: 'workspace_456',
        },
      ]);

      expect(standardOnly.connectedAccount).toBeNull();
      expect(standardOnly.connectedAccounts).toHaveLength(1);
      expect(standardOnly.connectedAccounts?.[0]).toMatchObject({
        id: 'data_installation_standard',
        connectionRole: 'standard',
        accountDisplayName: 'Acme staging',
      });
    },
  );
});

describe('Pipes credential response variants', () => {
  it.each(['oauth', 'client_credentials'] as const)(
    'deserializes %s access tokens',
    async (authMethod) => {
      const metadata = { instance_url: 'https://acme.my.salesforce.com' };
      fetchOnce({
        active: true,
        credential: {
          object: 'credential',
          auth_method: authMethod,
          value: 'token',
          expires_at: null,
          scopes: ['api'],
          missing_scopes: [],
          ...(authMethod === 'client_credentials' && { metadata }),
        },
      });
      const result: DataIntegrationCredentialsResponse =
        await workos.pipes.createDataIntegrationCredential({
          slug: 'provider',
          userId,
        });
      expect(result).toEqual({
        active: true,
        credential: {
          object: 'credential',
          authMethod,
          value: 'token',
          expiresAt: null,
          scopes: ['api'],
          missingScopes: [],
          ...(authMethod === 'client_credentials' && { metadata }),
        },
      });
      if (
        result.active &&
        result.credential.authMethod === 'client_credentials'
      ) {
        expect(result.credential.metadata).toEqual(metadata);
      }
    },
  );

  it('returns an API key without invented token fields', async () => {
    fetchOnce({
      active: true,
      credential: {
        object: 'credential',
        auth_method: 'api_key',
        value: 'secret',
      },
    });
    const result = await workos.pipes.createDataIntegrationCredential({
      slug: 'provider',
      userId,
    });
    expect(result).toEqual({
      active: true,
      credential: {
        object: 'credential',
        authMethod: 'api_key',
        value: 'secret',
      },
    });
  });

  it.each(['not_installed', 'needs_reauthorization'])(
    'returns an inactive %s response',
    async (error) => {
      fetchOnce({ active: false, error });
      const result = await workos.pipes.createDataIntegrationCredential({
        slug: 'provider',
        userId,
      });
      expect(result).toEqual({ active: false, error });
    },
  );

  it.each([
    [{ active: 'unexpected' }, 'Unknown active: unexpected'],
    [
      { active: true, credential: { auth_method: 'unexpected' } },
      'Unknown auth_method: unexpected',
    ],
  ])('rejects an unknown discriminator in %j', async (response, message) => {
    fetchOnce(response);
    await expect(
      workos.pipes.createDataIntegrationCredential({
        slug: 'provider',
        userId,
      }),
    ).rejects.toThrow(message);
  });
});
