import * as jose from 'jose';
import fetch from 'jest-fetch-mock';
import {
  fetchBody,
  fetchMethod,
  fetchOnce,
  fetchSearchParams,
  fetchURL,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import createClaimAttemptFixture from './fixtures/create-claim-attempt.json';
import getAgentBlueprintFixture from './fixtures/get-agent-blueprint.json';
import getAgentInstanceFixture from './fixtures/get-agent-instance.json';
import getAgentInstanceSessionFixture from './fixtures/get-agent-instance-session.json';
import getAgentRegistrationFixture from './fixtures/get-agent-registration.json';
import listAgentBlueprintsFixture from './fixtures/list-agent-blueprints.json';
import listAgentInstanceSessionsFixture from './fixtures/list-agent-instance-sessions.json';
import listAgentInstancesFixture from './fixtures/list-agent-instances.json';
import mintAgentTokenFixture from './fixtures/mint-agent-token.json';
import validateAgentCredentialFixture from './fixtures/validate-agent-credential.json';

const EXPECTED_BLUEPRINT = {
  object: 'agent_blueprint',
  id: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
  name: 'Prospecting Agent',
  description: 'Finds and qualifies sales prospects.',
  permissions: ['crm:read', 'email:send'],
  invocableBy: {
    roleSlugs: ['manager'],
    organizationIds: ['org_01EHWNCE74X7JSDV0X3SZ3KJNY'],
  },
  sessionSettings: {
    maxAgeSeconds: 3600,
    accessTokenTtlSeconds: 300,
    refreshTokenTtlSeconds: 3600,
  },
  createdAt: '2023-07-18T02:07:19.911Z',
  updatedAt: '2023-07-18T02:07:19.911Z',
};

jest.mock('jose', () => ({
  ...jest.requireActual('jose'),
  jwtVerify: jest.fn(),
}));

const ACCESS_TOKEN_PAYLOAD = {
  iss: 'https://auth.example.com',
  aud: 'proj_123',
  sub: 'agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
  jti: '01EHZNVPK3SFK441A1RGBFSHRT',
  org_id: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
  scope: 'read write',
  exp: 4102444800, // 2100-01-01T00:00:00Z
  iat: 1689646039,
};

const EXPECTED_CLAIMS = {
  issuer: 'https://auth.example.com',
  audience: 'proj_123',
  registrationId: 'agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
  jti: '01EHZNVPK3SFK441A1RGBFSHRT',
  organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
  scope: 'read write',
  actor: undefined,
  expiresAt: 4102444800,
  issuedAt: 1689646039,
};

describe('Agents', () => {
  let workos: WorkOS;

  beforeAll(() => {
    workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
      apiHostname: 'api.workos.test',
      clientId: 'proj_123',
    });
  });

  beforeEach(() => {
    fetch.resetMocks();
    jest.mocked(jose.jwtVerify).mockReset();
  });

  describe('linkClaimAttemptToExternalUser', () => {
    it('sends the request and deserializes the response', async () => {
      fetchOnce(createClaimAttemptFixture);

      const result = await workos.agents.linkClaimAttemptToExternalUser({
        claimAttemptToken: 'cla_tkn_01EHWNCE74X7JSDV0X3SZ3KJNY',
        user: {
          email: 'alice@example.com',
          externalId: 'user_abc123',
        },
      });

      expect(fetchURL()).toContain('/agents/claims/attempts');
      expect(fetchMethod()).toBe('PATCH');
      expect(fetchBody()).toEqual({
        type: 'link_external_user',
        claim_attempt_token: 'cla_tkn_01EHWNCE74X7JSDV0X3SZ3KJNY',
        user: {
          email: 'alice@example.com',
          external_id: 'user_abc123',
        },
      });
      expect(result).toEqual({
        id: 'agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
        status: 'unverified',
        userCode: 'BCDF-GHJK',
        organizations: [
          {
            id: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
            name: 'Acme Corp',
          },
        ],
      });
    });

    it('includes organizationId when provided', async () => {
      fetchOnce(createClaimAttemptFixture);

      await workos.agents.linkClaimAttemptToExternalUser({
        claimAttemptToken: 'cla_tkn_01EHWNCE74X7JSDV0X3SZ3KJNY',
        user: {
          email: 'alice@example.com',
          externalId: 'user_abc123',
        },
        organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
      });

      expect(fetchBody()).toEqual({
        type: 'link_external_user',
        claim_attempt_token: 'cla_tkn_01EHWNCE74X7JSDV0X3SZ3KJNY',
        user: {
          email: 'alice@example.com',
          external_id: 'user_abc123',
        },
        organization_id: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
      });
    });

    it('omits organizationId from the payload when not provided', async () => {
      fetchOnce(createClaimAttemptFixture);

      await workos.agents.linkClaimAttemptToExternalUser({
        claimAttemptToken: 'cla_tkn_01EHWNCE74X7JSDV0X3SZ3KJNY',
        user: {
          email: 'alice@example.com',
          externalId: 'user_abc123',
        },
      });

      const body = fetchBody();
      expect(body).not.toHaveProperty('organization_id');
    });
  });

  describe('getRegistration', () => {
    it('retrieves an agent registration', async () => {
      fetchOnce(getAgentRegistrationFixture);

      const registration = await workos.agents.getRegistration(
        'agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
      );

      expect(fetchURL()).toContain(
        '/agents/registrations/agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
      );
      expect(registration).toEqual({
        id: 'agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
        agentIdentity: {
          id: 'agent_identity_01EHZNVPK3SFK441A1RGBFSHRT',
          userlandUserId: null,
          createdAt: '2023-07-18T02:07:19.911Z',
          updatedAt: '2023-07-18T02:07:19.911Z',
        },
        organizationId: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
        status: 'unverified',
        kind: 'anonymous',
        claim: {
          id: 'agent_reg_claim_01EHZNVPK3SFK441A1RGBFSHRT',
          claimCompletion: {
            id: 'agent_reg_claim_attempt_01EHZNVPK3SFK441A1RGBFSHRT',
            createdAt: '2023-07-18T02:07:19.911Z',
            updatedAt: '2023-07-18T02:07:19.911Z',
            expiresAt: '2099-01-01T00:00:00.000Z',
            claimedAt: '2023-07-18T02:08:00.000Z',
          },
          createdAt: '2023-07-18T02:07:19.911Z',
          updatedAt: '2023-07-18T02:07:19.911Z',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });

    it('encodes the registration id in the request path', async () => {
      fetchOnce(getAgentRegistrationFixture);

      await workos.agents.getRegistration('agent_reg/../../evil');

      expect(fetchURL()).toContain(
        '/agents/registrations/agent_reg%2F..%2F..%2Fevil',
      );
    });
  });

  describe('validateCredential', () => {
    describe('api_key', () => {
      it('validates the key against the server', async () => {
        fetchOnce(validateAgentCredentialFixture);

        const validation = await workos.agents.validateCredential({
          type: 'api_key',
          credential: 'sk_example',
        });

        expect(fetchURL()).toContain('/agents/credentials/validate');
        expect(fetchBody()).toEqual({
          type: 'api_key',
          credential: 'sk_example',
        });
        expect(validation).toEqual({
          valid: true,
          registrationId: 'agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
          expiresAt: '2099-01-01T00:00:00.000Z',
          claims: null,
        });
      });

      it('reports an invalid key', async () => {
        fetchOnce({ valid: false, registration_id: null, expires_at: null });

        const validation = await workos.agents.validateCredential({
          type: 'api_key',
          credential: 'sk_invalid',
        });

        expect(validation).toEqual({
          valid: false,
          registrationId: null,
          expiresAt: null,
          claims: null,
        });
      });

      it('reports invalid when the server omits the registration id', async () => {
        // Defensive: a valid verdict with no registration must not surface an
        // empty registration id to callers.
        fetchOnce({ valid: true, registration_id: null, expires_at: null });

        const validation = await workos.agents.validateCredential({
          type: 'api_key',
          credential: 'sk_example',
        });

        expect(validation).toEqual({
          valid: false,
          registrationId: null,
          expiresAt: null,
          claims: null,
        });
      });
    });

    describe('access_token', () => {
      it('decodes and verifies the token locally without a network request', async () => {
        jest
          .mocked(jose.jwtVerify)
          .mockResolvedValue({ payload: ACCESS_TOKEN_PAYLOAD } as never);

        const validation = await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.token.value',
        });

        expect(fetch).not.toHaveBeenCalled();
        // Audience defaults to the configured client ID.
        expect(jose.jwtVerify).toHaveBeenCalledWith(
          'eyJ.token.value',
          expect.anything(),
          { audience: 'proj_123' },
        );
        expect(validation).toEqual({
          valid: true,
          registrationId: 'agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
          expiresAt: '2100-01-01T00:00:00.000Z',
          claims: EXPECTED_CLAIMS,
        });
      });

      it('verifies against a caller-supplied audience for resource-scoped tokens', async () => {
        jest
          .mocked(jose.jwtVerify)
          .mockResolvedValue({ payload: ACCESS_TOKEN_PAYLOAD } as never);

        await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.token.value',
          audience: 'https://api.example.com',
        });

        expect(jose.jwtVerify).toHaveBeenCalledWith(
          'eyJ.token.value',
          expect.anything(),
          { audience: 'https://api.example.com' },
        );
      });

      it('reports an invalid token when the audience does not match', async () => {
        jest.mocked(jose.jwtVerify).mockImplementation(() => {
          const error = new Error('audience mismatch') as Error & {
            code: string;
          };
          error.code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
          throw error;
        });

        const validation = await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.wrong.audience',
        });

        expect(validation).toEqual({
          valid: false,
          registrationId: null,
          expiresAt: null,
          claims: null,
        });
      });

      it('reports invalid for a token missing the agent identity claims', async () => {
        // A token signed by the same JWKS with the right audience but without
        // the agent claims (sub/jti/org_id) is not an agent credential.
        const { sub, ...withoutSub } = ACCESS_TOKEN_PAYLOAD;
        jest
          .mocked(jose.jwtVerify)
          .mockResolvedValue({ payload: withoutSub } as never);

        const validation = await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.no.agent.claims',
        });

        expect(validation).toEqual({
          valid: false,
          registrationId: null,
          expiresAt: null,
          claims: null,
        });
      });

      it('reports invalid for a token whose expiry is in the past', async () => {
        // jose is mocked here, so this exercises the SDK's own past-expiry
        // guard rather than jose's built-in exp check.
        jest.mocked(jose.jwtVerify).mockResolvedValue({
          payload: { ...ACCESS_TOKEN_PAYLOAD, exp: 1000 },
        } as never);

        const validation = await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.expired.token',
        });

        expect(validation).toEqual({
          valid: false,
          registrationId: null,
          expiresAt: null,
          claims: null,
        });
      });

      it('reports an invalid token when verification fails', async () => {
        jest.mocked(jose.jwtVerify).mockImplementation(() => {
          const error = new Error('expired') as Error & { code: string };
          error.code = 'ERR_JWT_EXPIRED';
          throw error;
        });

        const validation = await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.expired.token',
        });

        expect(fetch).not.toHaveBeenCalled();
        expect(validation).toEqual({
          valid: false,
          registrationId: null,
          expiresAt: null,
          claims: null,
        });
      });

      it('checks the server for revocation when checkForRevoked is set', async () => {
        jest
          .mocked(jose.jwtVerify)
          .mockResolvedValue({ payload: ACCESS_TOKEN_PAYLOAD } as never);
        fetchOnce(validateAgentCredentialFixture);

        const validation = await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.token.value',
          checkForRevoked: true,
        });

        expect(fetchURL()).toContain('/agents/credentials/validate');
        expect(fetchBody()).toEqual({
          type: 'access_token',
          credential: 'eyJ.token.value',
        });
        expect(validation).toEqual({
          valid: true,
          registrationId: 'agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
          expiresAt: '2099-01-01T00:00:00.000Z',
          claims: EXPECTED_CLAIMS,
        });
      });

      it('forwards the audience to the server when checking for revocation', async () => {
        jest
          .mocked(jose.jwtVerify)
          .mockResolvedValue({ payload: ACCESS_TOKEN_PAYLOAD } as never);
        fetchOnce(validateAgentCredentialFixture);

        await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.token.value',
          checkForRevoked: true,
          audience: 'https://api.example.com',
        });

        expect(fetchBody()).toEqual({
          type: 'access_token',
          credential: 'eyJ.token.value',
          audience: 'https://api.example.com',
        });
      });

      it('reports invalid when the server returns a different registration id than the token', async () => {
        jest
          .mocked(jose.jwtVerify)
          .mockResolvedValue({ payload: ACCESS_TOKEN_PAYLOAD } as never);
        fetchOnce({
          valid: true,
          registration_id: 'agent_reg_DIFFERENT',
          expires_at: '2099-01-01T00:00:00.000Z',
        });

        const validation = await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.token.value',
          checkForRevoked: true,
        });

        expect(validation).toEqual({
          valid: false,
          registrationId: null,
          expiresAt: null,
          claims: null,
        });
      });

      it('reports a revoked token as invalid and drops its claims', async () => {
        jest
          .mocked(jose.jwtVerify)
          .mockResolvedValue({ payload: ACCESS_TOKEN_PAYLOAD } as never);
        fetchOnce({ valid: false, registration_id: null, expires_at: null });

        const validation = await workos.agents.validateCredential({
          type: 'access_token',
          credential: 'eyJ.revoked.token',
          checkForRevoked: true,
        });

        expect(validation).toEqual({
          valid: false,
          registrationId: null,
          expiresAt: null,
          claims: null,
        });
      });
    });
  });

  describe('createBlueprint', () => {
    it('sends the request and deserializes the response', async () => {
      fetchOnce(getAgentBlueprintFixture, { status: 201 });

      const blueprint = await workos.agents.createBlueprint({
        name: 'Prospecting Agent',
        description: 'Finds and qualifies sales prospects.',
        permissions: ['crm:read', 'email:send'],
        invocableBy: {
          roleSlugs: ['manager'],
          organizationIds: ['org_01EHWNCE74X7JSDV0X3SZ3KJNY'],
        },
        sessionSettings: {
          maxAgeSeconds: 3600,
          accessTokenTtlSeconds: 300,
          refreshTokenTtlSeconds: 3600,
        },
      });

      expect(fetchURL()).toContain('/agents/blueprints');
      expect(fetchMethod()).toBe('POST');
      expect(fetchBody()).toEqual({
        name: 'Prospecting Agent',
        description: 'Finds and qualifies sales prospects.',
        permissions: ['crm:read', 'email:send'],
        invocable_by: {
          role_slugs: ['manager'],
          organization_ids: ['org_01EHWNCE74X7JSDV0X3SZ3KJNY'],
        },
        session_settings: {
          max_age_seconds: 3600,
          access_token_ttl_seconds: 300,
          refresh_token_ttl_seconds: 3600,
        },
      });
      expect(blueprint).toEqual(EXPECTED_BLUEPRINT);
    });

    it('omits optional fields that are not provided', async () => {
      fetchOnce(getAgentBlueprintFixture, { status: 201 });

      await workos.agents.createBlueprint({
        name: 'Prospecting Agent',
        sessionSettings: {
          maxAgeSeconds: 3600,
          accessTokenTtlSeconds: 300,
          refreshTokenTtlSeconds: 3600,
        },
      });

      expect(fetchBody()).toEqual({
        name: 'Prospecting Agent',
        session_settings: {
          max_age_seconds: 3600,
          access_token_ttl_seconds: 300,
          refresh_token_ttl_seconds: 3600,
        },
      });
    });
  });

  describe('listBlueprints', () => {
    it('lists agent blueprints', async () => {
      fetchOnce(listAgentBlueprintsFixture);

      const { data } = await workos.agents.listBlueprints();

      expect(fetchURL()).toContain('/agents/blueprints');
      expect(fetchMethod()).toBe('GET');
      expect(data).toEqual([EXPECTED_BLUEPRINT]);
    });

    it('sends pagination options as query parameters', async () => {
      fetchOnce(listAgentBlueprintsFixture);

      await workos.agents.listBlueprints({
        limit: 10,
        after: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        order: 'asc',
      });

      expect(fetchSearchParams()).toEqual({
        limit: '10',
        after: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        order: 'asc',
      });
    });
  });

  describe('getBlueprint', () => {
    it('gets an agent blueprint by ID', async () => {
      fetchOnce(getAgentBlueprintFixture);

      const blueprint = await workos.agents.getBlueprint(
        'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );

      expect(fetchURL()).toContain(
        '/agents/blueprints/agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );
      expect(fetchMethod()).toBe('GET');
      expect(blueprint).toEqual(EXPECTED_BLUEPRINT);
    });
  });

  describe('updateBlueprint', () => {
    it('sends only the provided fields', async () => {
      fetchOnce(getAgentBlueprintFixture);

      const blueprint = await workos.agents.updateBlueprint({
        agentBlueprintId: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        name: 'Prospecting Agent',
        sessionSettings: {
          accessTokenTtlSeconds: 300,
        },
      });

      expect(fetchURL()).toContain(
        '/agents/blueprints/agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );
      expect(fetchMethod()).toBe('PATCH');
      expect(fetchBody()).toEqual({
        name: 'Prospecting Agent',
        session_settings: {
          access_token_ttl_seconds: 300,
        },
      });
      expect(blueprint).toEqual(EXPECTED_BLUEPRINT);
    });

    it('sends a null description to clear it', async () => {
      fetchOnce(getAgentBlueprintFixture);

      await workos.agents.updateBlueprint({
        agentBlueprintId: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        description: null,
      });

      expect(fetchBody()).toEqual({ description: null });
    });
  });

  describe('deleteBlueprint', () => {
    it('deletes an agent blueprint by ID', async () => {
      fetchOnce(undefined, { status: 204 });

      await workos.agents.deleteBlueprint(
        'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );

      expect(fetchURL()).toContain(
        '/agents/blueprints/agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );
      expect(fetchMethod()).toBe('DELETE');
    });
  });

  describe('mintToken', () => {
    const expectedToken = {
      accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example.token',
      tokenType: 'Bearer',
      expiresIn: 300,
      refreshToken: 'refresh_token_example',
      agentInstanceId: 'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
      newInstance: true,
      agentInstanceSessionId:
        'agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY',
      permissions: ['crm:read', 'email:send'],
    };

    it('mints a user-delegated token', async () => {
      fetchOnce(mintAgentTokenFixture);

      const token = await workos.agents.mintToken({
        agentBlueprintId: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        type: 'user_delegated',
        userAccessToken: 'user_access_token_example',
        intent: 'Prospect new leads',
      });

      expect(fetchURL()).toContain(
        '/agents/blueprints/agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY/tokens',
      );
      expect(fetchMethod()).toBe('POST');
      expect(fetchBody()).toEqual({
        type: 'user_delegated',
        user_access_token: 'user_access_token_example',
        intent: 'Prospect new leads',
      });
      expect(token).toEqual(expectedToken);
    });

    it('mints an autonomous token', async () => {
      fetchOnce(mintAgentTokenFixture);

      await workos.agents.mintToken({
        agentBlueprintId: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        type: 'autonomous',
        organizationId: 'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
      });

      expect(fetchBody()).toEqual({
        type: 'autonomous',
        organization_id: 'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
      });
    });

    it('mints an agent-delegated token', async () => {
      fetchOnce(mintAgentTokenFixture);

      await workos.agents.mintToken({
        agentBlueprintId: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        type: 'agent_delegated',
        agentAccessToken: 'agent_access_token_example',
      });

      expect(fetchBody()).toEqual({
        type: 'agent_delegated',
        agent_access_token: 'agent_access_token_example',
      });
    });

    it('refreshes a token', async () => {
      fetchOnce(mintAgentTokenFixture);

      await workos.agents.mintToken({
        agentBlueprintId: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        type: 'refresh',
        refreshToken: 'refresh_token_example',
      });

      expect(fetchBody()).toEqual({
        type: 'refresh',
        refresh_token: 'refresh_token_example',
      });
    });
  });

  describe('listInstances', () => {
    it('lists agent instances with filters', async () => {
      fetchOnce(listAgentInstancesFixture);

      const { data } = await workos.agents.listInstances({
        organizationId: 'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
        agentBlueprintId: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        limit: 10,
      });

      expect(fetchURL()).toContain('/agents/instances');
      expect(fetchMethod()).toBe('GET');
      expect(fetchSearchParams()).toEqual({
        organization_id: 'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
        agent_blueprint_id: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        limit: '10',
        order: 'desc',
      });
      expect(data).toEqual([
        {
          object: 'agent_instance',
          id: 'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
          agentBlueprintId: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
          organizationId: 'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
          organizationMembershipId: null,
          type: 'autonomous',
          createdAt: '2023-07-18T02:07:19.911Z',
          updatedAt: '2023-07-18T02:07:19.911Z',
        },
      ]);
    });
  });

  describe('getInstance', () => {
    it('gets an agent instance by ID', async () => {
      fetchOnce(getAgentInstanceFixture);

      const instance = await workos.agents.getInstance(
        'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );

      expect(fetchURL()).toContain(
        '/agents/instances/agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );
      expect(fetchMethod()).toBe('GET');
      expect(instance).toEqual({
        object: 'agent_instance',
        id: 'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
        agentBlueprintId: 'agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY',
        organizationId: 'org_01EHWNCE74X7JSDV0X3SZ3KJNY',
        organizationMembershipId: 'om_01EHWNCE74X7JSDV0X3SZ3KJNY',
        type: 'delegated',
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });
  });

  describe('deleteInstance', () => {
    it('deletes an agent instance by ID', async () => {
      fetchOnce(undefined, { status: 204 });

      await workos.agents.deleteInstance(
        'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );

      expect(fetchURL()).toContain(
        '/agents/instances/agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );
      expect(fetchMethod()).toBe('DELETE');
    });
  });

  describe('listInstanceSessions', () => {
    it('lists agent instance sessions with filters', async () => {
      fetchOnce(listAgentInstanceSessionsFixture);

      const { data } = await workos.agents.listInstanceSessions({
        agentInstanceId: 'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
      });

      expect(fetchURL()).toContain('/agents/sessions');
      expect(fetchMethod()).toBe('GET');
      expect(fetchSearchParams()).toEqual({
        agent_instance_id: 'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
        order: 'desc',
      });
      expect(data).toEqual([
        {
          object: 'agent_instance_session',
          id: 'agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY',
          agentInstanceId: 'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
          status: 'active',
          expiresAt: '2099-01-01T00:00:00.000Z',
          revokedAt: null,
          createdAt: '2023-07-18T02:07:19.911Z',
          updatedAt: '2023-07-18T02:07:19.911Z',
        },
      ]);
    });
  });

  describe('getInstanceSession', () => {
    it('gets an agent instance session by ID', async () => {
      fetchOnce(getAgentInstanceSessionFixture);

      const session = await workos.agents.getInstanceSession(
        'agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );

      expect(fetchURL()).toContain(
        '/agents/sessions/agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );
      expect(fetchMethod()).toBe('GET');
      expect(session).toEqual({
        object: 'agent_instance_session',
        id: 'agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY',
        agentInstanceId: 'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
        status: 'active',
        expiresAt: '2099-01-01T00:00:00.000Z',
        revokedAt: null,
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });
  });

  describe('revokeInstanceSession', () => {
    it('revokes an agent instance session by ID', async () => {
      fetchOnce({
        ...getAgentInstanceSessionFixture,
        status: 'revoked',
        revoked_at: '2023-07-18T02:08:00.000Z',
      });

      const session = await workos.agents.revokeInstanceSession(
        'agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY',
      );

      expect(fetchURL()).toContain(
        '/agents/sessions/agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY/revoke',
      );
      expect(fetchMethod()).toBe('POST');
      expect(session).toEqual({
        object: 'agent_instance_session',
        id: 'agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY',
        agentInstanceId: 'agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY',
        status: 'revoked',
        expiresAt: '2099-01-01T00:00:00.000Z',
        revokedAt: '2023-07-18T02:08:00.000Z',
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });
  });
});
