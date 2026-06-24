import fetch from 'jest-fetch-mock';
import { fetchBody, fetchOnce, fetchURL } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import getAgentRegistrationFixture from './fixtures/get-agent-registration.json';
import validateAgentCredentialFixture from './fixtures/validate-agent-credential.json';

describe('Agents', () => {
  let workos: WorkOS;

  beforeAll(() => {
    workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU', {
      apiHostname: 'api.workos.test',
      clientId: 'proj_123',
    });
  });

  beforeEach(() => fetch.resetMocks());

  describe('getRegistration', () => {
    it('retrieves an agent registration', async () => {
      fetchOnce(getAgentRegistrationFixture);

      const registration = await workos.agents.getRegistration(
        'agent_registration_01EHZNVPK3SFK441A1RGBFSHRT',
      );

      expect(fetchURL()).toContain(
        '/agents/registrations/agent_registration_01EHZNVPK3SFK441A1RGBFSHRT',
      );
      expect(registration).toEqual({
        id: 'agent_registration_01EHZNVPK3SFK441A1RGBFSHRT',
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
          id: 'agent_registration_claim_01EHZNVPK3SFK441A1RGBFSHRT',
          claimCompletion: null,
          createdAt: '2023-07-18T02:07:19.911Z',
          updatedAt: '2023-07-18T02:07:19.911Z',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
        createdAt: '2023-07-18T02:07:19.911Z',
        updatedAt: '2023-07-18T02:07:19.911Z',
      });
    });
  });

  describe('validateCredential', () => {
    it('validates an agent credential', async () => {
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
        registrationId: 'agent_registration_01EHZNVPK3SFK441A1RGBFSHRT',
        expiresAt: '2099-01-01T00:00:00.000Z',
      });
    });

    it('reports an invalid credential', async () => {
      fetchOnce({
        valid: false,
        registration_id: null,
        expires_at: null,
      });

      const validation = await workos.agents.validateCredential({
        type: 'access_token',
        credential: 'invalid',
      });

      expect(fetchURL()).toContain('/agents/credentials/validate');
      expect(validation).toEqual({
        valid: false,
        registrationId: null,
        expiresAt: null,
      });
    });
  });
});
