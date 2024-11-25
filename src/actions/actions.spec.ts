import crypto from 'crypto';
import { WorkOS } from '../workos';
import { mockActionContext } from './fixtures/action-context';
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
        // tslint:disable-next-line
        workos.actions['signatureProvider'],
        'verifyHeader',
      );

      const timestamp = Date.now() * 1000;
      const unhashedString = `${timestamp}.${JSON.stringify(
        mockActionContext,
      )}`;
      const signatureHash = crypto
        .createHmac('sha256', secret)
        .update(unhashedString)
        .digest()
        .toString('hex');

      await workos.actions.verifyHeader({
        payload: mockActionContext,
        sigHeader: `t=${timestamp}, v1=${signatureHash}`,
        secret,
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('deserialize', () => {
    it('throws a SignatureVerificationException if the signature is missing', async () => {
      await expect(
        workos.actions.deserialize({
          payload: mockActionContext,
          sigHeader: '',
          secret,
          type: 'authentication',
        }),
      ).rejects.toThrow('Signature or timestamp missing');
    });

    it('throws a SignatureVerificationException if the signature is invalid', async () => {
      const timestamp = Date.now() * 1000;
      const unhashedString = `${timestamp}.${JSON.stringify(
        mockActionContext,
      )}`;
      const signatureHash = crypto
        .createHmac('sha256', secret)
        .update(unhashedString)
        .digest()
        .toString('hex');

      await expect(
        workos.actions.deserialize({
          payload: mockActionContext,
          sigHeader: `t=${timestamp}, v1=${signatureHash}`,
          secret: 'invalid',
          type: 'authentication',
        }),
      ).rejects.toThrow(
        'Signature hash does not match the expected signature hash for payload',
      );
    });

    it('returns the payload if the signature is valid', async () => {
      const timestamp = Date.now() * 1000;
      const unhashedString = `${timestamp}.${JSON.stringify(
        mockActionContext,
      )}`;
      const signatureHash = crypto
        .createHmac('sha256', secret)
        .update(unhashedString)
        .digest()
        .toString('hex');

      const payload = await workos.actions.deserialize({
        payload: mockActionContext,
        sigHeader: `t=${timestamp}, v1=${signatureHash}`,
        secret,
        type: 'authentication',
      });

      expect(payload).toEqual(mockActionContext);
    });
  });
});
