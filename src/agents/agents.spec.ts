import * as jose from 'jose';
import fetch from 'jest-fetch-mock';
import { fetchBody, fetchOnce, fetchURL } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import getAgentRegistrationFixture from './fixtures/get-agent-registration.json';
import validateAgentCredentialFixture from './fixtures/validate-agent-credential.json';

jest.mock('jose', () => ({
  ...jest.requireActual('jose'),
  jwtVerify: jest.fn(),
}));

const ACCESS_TOKEN_PAYLOAD = {
  iss: 'https://auth.example.com',
  aud: 'proj_123',
  sub: 'agent_reg_01EHZNVPK3SFK441A1RGBFSHRT',
  jti: '01EHZNVPK3SFK441A1RGBFSHRT',
  organization_id: 'org_01EHZNVPK3SFK441A1RGBFSHRT',
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
        // the agent claims (sub/jti/organization_id) is not an agent credential.
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
});
