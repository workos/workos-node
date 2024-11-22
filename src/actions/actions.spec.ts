import crypto from 'crypto';
import { WorkOS } from '../workos';
import mockAuthActionContext from './fixtures/authentication-action-context.json';
import mockUserRegistrationActionContext from './fixtures/user-registration-action-context.json';
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
import { NodeCryptoProvider } from '../common/crypto';

describe('Actions', () => {
  let secret: string;

  beforeEach(() => {
    secret = 'secret';
  });

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
    it('aliases to the signature provider', async () => {
      const spy = jest.spyOn(
        // TODO: See if I can really test this without a spy
        // tslint:disable-next-line
        workos.actions['signatureProvider'],
        'verifyHeader',
      );

      const timestamp = Date.now() * 1000;
      const unhashedString = `${timestamp}.${JSON.stringify(
        mockAuthActionContext,
      )}`;
      const signatureHash = crypto
        .createHmac('sha256', secret)
        .update(unhashedString)
        .digest()
        .toString('hex');

      await workos.actions.verifyHeader({
        payload: mockAuthActionContext,
        sigHeader: `t=${timestamp}, v1=${signatureHash}`,
        secret,
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('constructAction', () => {
    it('returns an authentication action', async () => {
      const timestamp = Date.now() * 1000;
      const payload = mockAuthActionContext;
      const unhashedString = `${timestamp}.${JSON.stringify(payload)}`;
      const signatureHash = crypto
        .createHmac('sha256', secret)
        .update(unhashedString)
        .digest()
        .toString('hex');
      const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
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
        },
        ipAddress: '50.141.123.10',
        userAgent: 'Mozilla/5.0',
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
      const timestamp = Date.now() * 1000;
      const payload = mockUserRegistrationActionContext;
      const unhashedString = `${timestamp}.${JSON.stringify(payload)}`;
      const signatureHash = crypto
        .createHmac('sha256', secret)
        .update(unhashedString)
        .digest()
        .toString('hex');
      const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
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
    // describe('with the correct payload, sig_header, secret, and tolerance', () => {
    //   it('returns a webhook event', async () => {
    //     const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
    //     const options = { payload, sigHeader, secret, tolerance: 200 };
    //     const webhook = await workos.webhooks.constructEvent(options);

    //     expect(webhook.data).toEqual(expectation);
    //     expect(webhook.event).toEqual('dsync.user.created');
    //     expect(webhook.id).toEqual('wh_123');
    //   });
    // });

    // describe('with an empty header', () => {
    //   it('raises an error', async () => {
    //     const sigHeader = '';
    //     const options = { payload, sigHeader, secret };

    //     await expect(
    //       workos.webhooks.constructEvent(options),
    //     ).rejects.toThrowError(SignatureVerificationException);
    //   });
    // });

    // describe('with an empty signature hash', () => {
    //   it('raises an error', async () => {
    //     const sigHeader = `t=${timestamp}, v1=`;
    //     const options = { payload, sigHeader, secret };

    //     await expect(
    //       workos.webhooks.constructEvent(options),
    //     ).rejects.toThrowError(SignatureVerificationException);
    //   });
    // });

    // describe('with an incorrect signature hash', () => {
    //   it('raises an error', async () => {
    //     const sigHeader = `t=${timestamp}, v1=99999`;
    //     const options = { payload, sigHeader, secret };

    //     await expect(
    //       workos.webhooks.constructEvent(options),
    //     ).rejects.toThrowError(SignatureVerificationException);
    //   });
    // });

    // describe('with an incorrect payload', () => {
    //   it('raises an error', async () => {
    //     const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
    //     payload = 'invalid';
    //     const options = { payload, sigHeader, secret };

    //     await expect(
    //       workos.webhooks.constructEvent(options),
    //     ).rejects.toThrowError(SignatureVerificationException);
    //   });
    // });

    // describe('with an incorrect webhook secret', () => {
    //   it('raises an error', async () => {
    //     const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
    //     secret = 'invalid';
    //     const options = { payload, sigHeader, secret };

    //     await expect(
    //       workos.webhooks.constructEvent(options),
    //     ).rejects.toThrowError(SignatureVerificationException);
    //   });
    // });

    // describe('with a timestamp outside tolerance', () => {
    //   it('raises an error', async () => {
    //     const sigHeader = `t=9999, v1=${signatureHash}`;
    //     const options = { payload, sigHeader, secret };

    //     await expect(
    //       workos.webhooks.constructEvent(options),
    //     ).rejects.toThrowError(SignatureVerificationException);
    //   });
    // });
  });
});
