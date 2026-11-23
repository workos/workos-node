import type { AuthorizedConnectApplicationResponse } from '../interfaces';
import { deserializeAuthorizedConnectApplication } from './authorized-connect-application.serializer';

describe('deserializeAuthorizedConnectApplication', () => {
  it('deserializes an authorization without an OAuth resource and a nested M2M application', () => {
    const response: AuthorizedConnectApplicationResponse = {
      object: 'authorized_connect_application',
      id: 'authorized_connect_app_123',
      granted_scopes: [],
      application: {
        object: 'connect_application',
        id: 'conn_app_123',
        client_id: 'client_123',
        name: 'M2M Application',
        description: null,
        scopes: [],
        created_at: '2026-01-15T12:00:00.000Z',
        updated_at: '2026-01-15T12:00:00.000Z',
        application_type: 'm2m',
        organization_id: 'org_123',
      },
    };

    expect(deserializeAuthorizedConnectApplication(response)).toEqual({
      object: 'authorized_connect_application',
      id: 'authorized_connect_app_123',
      grantedScopes: [],
      oauthResource: undefined,
      application: {
        object: 'connect_application',
        id: 'conn_app_123',
        clientId: 'client_123',
        name: 'M2M Application',
        description: null,
        scopes: [],
        createdAt: new Date('2026-01-15T12:00:00.000Z'),
        updatedAt: new Date('2026-01-15T12:00:00.000Z'),
        applicationType: 'm2m',
        organizationId: 'org_123',
      },
    });
  });
});
