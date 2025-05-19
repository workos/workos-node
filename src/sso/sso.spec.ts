import fetch from 'jest-fetch-mock';
import {
  fetchOnce,
  fetchURL,
  fetchHeaders,
  fetchBody,
  fetchSearchParams,
} from '../common/utils/test-utils';

import { WorkOS } from '../workos';
import { ConnectionResponse, ConnectionType } from './interfaces';
import { ListResponse } from '../common/interfaces';

describe('SSO', () => {
  beforeEach(() => fetch.resetMocks());

  const connectionResponse: ConnectionResponse = {
    object: 'connection',
    id: 'conn_123',
    organization_id: 'org_123',
    name: 'Connection',
    connection_type: ConnectionType.OktaSAML,
    state: 'active',
    domains: [],
    created_at: '2023-07-17T20:07:20.055Z',
    updated_at: '2023-07-17T20:07:20.055Z',
  };

  describe('SSO', () => {
    describe('with options', () => {
      it('requests Connections with query parameters', async () => {
        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
        const listConnectionsResponse: ListResponse<ConnectionResponse> = {
          object: 'list',
          data: [connectionResponse],
          list_metadata: {},
        };

        fetchOnce(listConnectionsResponse);

        await workos.sso.listConnections({
          connectionType: ConnectionType.OktaSAML,
          organizationId: 'org_123',
        });

        expect(fetchSearchParams()).toMatchObject({
          connection_type: ConnectionType.OktaSAML,
          organization_id: 'org_123',
        });
      });
    });

    describe('getAuthorizationUrl', () => {
      describe('with no custom api hostname', () => {
        it('generates an authorize url with the default api hostname', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationUrl({
            domain: 'lyft.com',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with no domain or provider', () => {
        it('throws an error for incomplete arguments', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const urlFn = () =>
            workos.sso.getAuthorizationUrl({
              clientId: 'proj_123',
              redirectUri: 'example.com/sso/workos/callback',
            });

          expect(urlFn).toThrowErrorMatchingSnapshot();
        });
      });

      describe('with a provider', () => {
        it('generates an authorize url with the provider', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationUrl({
            provider: 'Google',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with a connection', () => {
        it('generates an authorize url with the connection', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationUrl({
            connection: 'connection_123',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with an `organization`', () => {
        it('generates an authorization URL with the organization', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationUrl({
            organization: 'organization_123',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with a custom api hostname', () => {
        it('generates an authorize url with the custom api hostname', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
            apiHostname: 'api.workos.dev',
          });

          const url = workos.sso.getAuthorizationUrl({
            domain: 'lyft.com',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with state', () => {
        it('generates an authorize url with the provided state', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationUrl({
            domain: 'lyft.com',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
            state: 'custom state',
          });

          expect(url).toMatchSnapshot();
        });
      });

      describe('with domainHint', () => {
        it('generates an authorize url with the provided domain hint', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationUrl({
            domainHint: 'lyft.com',
            connection: 'connection_123',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
            state: 'custom state',
          });

          expect(url).toMatchInlineSnapshot(
            `"https://api.workos.com/sso/authorize?client_id=proj_123&connection=connection_123&domain_hint=lyft.com&redirect_uri=example.com%2Fsso%2Fworkos%2Fcallback&response_type=code&state=custom+state"`,
          );
        });
      });

      describe('with loginHint', () => {
        it('generates an authorize url with the provided login hint', () => {
          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

          const url = workos.sso.getAuthorizationUrl({
            loginHint: 'foo@workos.com',
            connection: 'connection_123',
            clientId: 'proj_123',
            redirectUri: 'example.com/sso/workos/callback',
            state: 'custom state',
          });

          expect(url).toMatchInlineSnapshot(
            `"https://api.workos.com/sso/authorize?client_id=proj_123&connection=connection_123&login_hint=foo%40workos.com&redirect_uri=example.com%2Fsso%2Fworkos%2Fcallback&response_type=code&state=custom+state"`,
          );
        });
      });
    });

    describe('getProfileAndToken', () => {
      describe('with all information provided', () => {
        it('sends a request to the WorkOS api for a profile', async () => {
          fetchOnce({
            access_token: '01DMEK0J53CVMC32CK5SE0KZ8Q',
            profile: {
              id: 'prof_123',
              idp_id: '123',
              organization_id: 'org_123',
              connection_id: 'conn_123',
              connection_type: 'OktaSAML',
              email: 'foo@test.com',
              first_name: 'foo',
              last_name: 'bar',
              role: {
                slug: 'admin',
              },
              groups: ['Admins', 'Developers'],
              raw_attributes: {
                email: 'foo@test.com',
                first_name: 'foo',
                last_name: 'bar',
                groups: ['Admins', 'Developers'],
                license: 'professional',
              },
              custom_attributes: {
                license: 'professional',
              },
            },
          });

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
          const { accessToken, profile } = await workos.sso.getProfileAndToken({
            code: 'authorization_code',
            clientId: 'proj_123',
          });

          expect(fetch.mock.calls.length).toEqual(1);

          expect(fetchBody()).toMatchSnapshot();
          expect(fetchHeaders()).toMatchSnapshot();
          expect(accessToken).toBe('01DMEK0J53CVMC32CK5SE0KZ8Q');
          expect(profile).toMatchSnapshot();
        });
      });

      describe('without a groups attribute', () => {
        it('sends a request to the WorkOS api for a profile', async () => {
          fetchOnce({
            access_token: '01DMEK0J53CVMC32CK5SE0KZ8Q',
            profile: {
              id: 'prof_123',
              idp_id: '123',
              organization_id: 'org_123',
              connection_id: 'conn_123',
              connection_type: 'OktaSAML',
              email: 'foo@test.com',
              first_name: 'foo',
              last_name: 'bar',
              role: {
                slug: 'admin',
              },
              raw_attributes: {
                email: 'foo@test.com',
                first_name: 'foo',
                last_name: 'bar',
              },
              custom_attributes: {},
            },
          });

          const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
          const { accessToken, profile } = await workos.sso.getProfileAndToken({
            code: 'authorization_code',
            clientId: 'proj_123',
          });

          expect(fetch.mock.calls.length).toEqual(1);

          expect(fetchBody()).toMatchSnapshot();
          expect(fetchHeaders()).toMatchSnapshot();
          expect(accessToken).toBe('01DMEK0J53CVMC32CK5SE0KZ8Q');
          expect(profile).toMatchSnapshot();
        });
      });
    });

    describe('getProfile', () => {
      it('calls the `/sso/profile` endpoint with the provided access token', async () => {
        fetchOnce({
          id: 'prof_123',
          idp_id: '123',
          organization_id: 'org_123',
          connection_id: 'conn_123',
          connection_type: 'OktaSAML',
          email: 'foo@test.com',
          first_name: 'foo',
          last_name: 'bar',
          role: {
            slug: 'admin',
          },
          groups: ['Admins', 'Developers'],
          raw_attributes: {
            email: 'foo@test.com',
            first_name: 'foo',
            last_name: 'bar',
            groups: ['Admins', 'Developers'],
          },
          custom_attributes: {},
        });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
        const profile = await workos.sso.getProfile({
          accessToken: 'access_token',
        });

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetchHeaders()).toMatchObject({
          Authorization: 'Bearer access_token',
        });

        expect(profile.id).toBe('prof_123');
      });
    });

    describe('deleteConnection', () => {
      it('sends request to delete a Connection', async () => {
        fetchOnce();

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.sso.deleteConnection('conn_123');

        expect(fetchURL()).toContain('/connections/conn_123');
      });
    });

    describe('getConnection', () => {
      it(`requests a Connection`, async () => {
        fetchOnce(connectionResponse);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const subject = await workos.sso.getConnection('conn_123');

        expect(fetchURL()).toContain('/connections/conn_123');

        expect(subject.connectionType).toEqual('OktaSAML');
      });
    });

    describe('listConnections', () => {
      it(`requests a list of Connections`, async () => {
        fetchOnce({
          data: [connectionResponse],
          list_metadata: {},
        });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const subject = await workos.sso.listConnections({
          organizationId: 'org_1234',
        });

        expect(fetchURL()).toContain('/connections');

        expect(subject.data).toHaveLength(1);
      });
    });
  });
});
