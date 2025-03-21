import crypto from 'crypto';
import { WorkOS } from '../workos';
import mockAuthActionContext from './fixtures/authentication-action-context.json';
import mockUserRegistrationActionContext from './fixtures/user-registration-action-context.json';
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
import { NodeCryptoProvider } from '../common/crypto/NodeCryptoProvider';

describe('Actions', () => {
  let secret: string;

  beforeEach(() => {
    secret = 'secret';
  });

  const makeSigHeader = (payload: unknown, secret: string) => {
    const timestamp = Date.now() * 1000;
    const unhashedString = `${timestamp}.${JSON.stringify(payload)}`;
    const signatureHash = crypto
      .createHmac('sha256', secret)
      .update(unhashedString)
      .digest()
      .toString('hex');
    return `t=${timestamp}, v1=${signatureHash}`;
  };

  describe('signResponse', () => {
    describe('type: authentication', () => {
      it('returns a signed response', async () => {
        const nodeCryptoProvider = new NodeCryptoProvider();

        const response = await workos.actions.signResponse(
          {
            type: 'authentication',
            verdict: 'Allow',
          },
          secret,
        );

        const signedPayload = `${response.payload.timestamp}.${JSON.stringify(
          response.payload,
        )}`;

        const expectedSig = await nodeCryptoProvider.computeHMACSignatureAsync(
          signedPayload,
          secret,
        );

        expect(response.object).toEqual('authentication_action_response');
        expect(response.payload.verdict).toEqual('Allow');
        expect(response.payload.timestamp).toBeGreaterThan(0);
        expect(response.signature).toEqual(expectedSig);
      });
    });

    describe('type: user_registration', () => {
      it('returns a signed response', async () => {
        const nodeCryptoProvider = new NodeCryptoProvider();

        const response = await workos.actions.signResponse(
          {
            type: 'user_registration',
            verdict: 'Deny',
            errorMessage: 'User already exists',
          },
          secret,
        );

        const signedPayload = `${response.payload.timestamp}.${JSON.stringify(
          response.payload,
        )}`;

        const expectedSig = await nodeCryptoProvider.computeHMACSignatureAsync(
          signedPayload,
          secret,
        );

        expect(response.object).toEqual('user_registration_action_response');
        expect(response.payload.verdict).toEqual('Deny');
        expect(response.payload.timestamp).toBeGreaterThan(0);
        expect(response.signature).toEqual(expectedSig);
      });
    });
  });

  describe('verifyHeader', () => {
    it('verifies the header', async () => {
      await expect(
        workos.actions.verifyHeader({
          payload: mockAuthActionContext,
          sigHeader: makeSigHeader(mockAuthActionContext, secret),
          secret,
        }),
      ).resolves.not.toThrow();
    });

    it('throws when the header is invalid', async () => {
      await expect(
        workos.actions.verifyHeader({
          payload: mockAuthActionContext,
          sigHeader: 't=123, v1=123',
          secret,
        }),
      ).rejects.toThrow();
    });
  });

  describe('constructAction', () => {
    it('returns an authentication action', async () => {
      const payload = mockAuthActionContext;
      const sigHeader = makeSigHeader(payload, secret);
      const action = await workos.actions.constructAction({
        payload,
        sigHeader,
        secret,
      });

      expect(action).toEqual({
        id: '01JATCMZJY26PQ59XT9BNT0FNN',
        user: {
          object: 'user',
          id: '01JATCHZVEC5EPANDPEZVM68Y9',
          email: 'jane@foocorp.com',
          firstName: 'Jane',
          lastName: 'Doe',
          emailVerified: true,
          profilePictureUrl: 'https://example.com/jane.jpg',
          createdAt: '2024-10-22T17:12:50.746Z',
          updatedAt: '2024-10-22T17:12:50.746Z',
          externalId: null,
          metadata: {},
        },
        ipAddress: '50.141.123.10',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'notafingerprint',
        issuer: 'test',
        object: 'authentication_action_context',
        organization: {
          object: 'organization',
          id: '01JATCMZJY26PQ59XT9BNT0FNN',
          name: 'Foo Corp',
          allowProfilesOutsideOrganization: false,
          domains: [],
          createdAt: '2024-10-22T17:12:50.746Z',
          updatedAt: '2024-10-22T17:12:50.746Z',
          externalId: null,
          metadata: {},
        },
        organizationMembership: {
          object: 'organization_membership',
          id: '01JATCNVYCHT1SZGENR4QTXKRK',
          userId: '01JATCHZVEC5EPANDPEZVM68Y9',
          organizationId: '01JATCMZJY26PQ59XT9BNT0FNN',
          role: {
            slug: 'member',
          },
          status: 'active',
          createdAt: '2024-10-22T17:12:50.746Z',
          updatedAt: '2024-10-22T17:12:50.746Z',
        },
      });
    });

    it('returns a user registration action', async () => {
      const payload = mockUserRegistrationActionContext;
      const sigHeader = makeSigHeader(payload, secret);
      const action = await workos.actions.constructAction({
        payload,
        sigHeader,
        secret,
      });

      expect(action).toEqual({
        id: '01JATCMZJY26PQ59XT9BNT0FNN',
        object: 'user_registration_action_context',
        userData: {
          object: 'user_data',
          email: 'jane@foocorp.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
        ipAddress: '50.141.123.10',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'notafingerprint',
        invitation: expect.objectContaining({
          object: 'invitation',
          id: '01JBVZWH8HJ855YZ5BWHG1WNZN',
          email: 'jane@foocorp.com',
          expiresAt: '2024-10-22T17:12:50.746Z',
          createdAt: '2024-10-21T17:12:50.746Z',
          updatedAt: '2024-10-21T17:12:50.746Z',
          acceptedAt: '2024-10-22T17:13:50.746Z',
        }),
      });
    });
  });
});
