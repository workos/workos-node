import crypto from 'crypto';
import { SubtleCryptoProvider } from './SubtleCryptoProvider';
import mockWebhook from '../../webhooks/fixtures/webhook.json';
import { SignatureProvider } from './SignatureProvider';

describe('SignatureProvider', () => {
  let payload: any;
  let secret: string;
  let timestamp: number;
  let signatureHash: string;
  const signatureProvider = new SignatureProvider(new SubtleCryptoProvider());

  beforeEach(() => {
    payload = mockWebhook;
    secret = 'secret';
    timestamp = Date.now() * 1000;
    const unhashedString = `${timestamp}.${JSON.stringify(payload)}`;
    signatureHash = crypto
      .createHmac('sha256', secret)
      .update(unhashedString)
      .digest()
      .toString('hex');
  });

  describe('verifyHeader', () => {
    it('returns true when the signature is valid', async () => {
      const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
      const options = { payload, sigHeader, secret };
      const result = await signatureProvider.verifyHeader(options);
      expect(result).toBeTruthy();
    });
  });

  describe('getTimestampAndSignatureHash', () => {
    it('returns the timestamp and signature when the signature is valid', () => {
      const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
      const timestampAndSignature =
        signatureProvider.getTimestampAndSignatureHash(sigHeader);

      expect(timestampAndSignature).toEqual([
        timestamp.toString(),
        signatureHash,
      ]);
    });
  });

  describe('computeSignature', () => {
    it('returns the computed signature', async () => {
      const signature = await signatureProvider.computeSignature(
        timestamp,
        payload,
        secret,
      );

      expect(signature).toEqual(signatureHash);
    });
  });

  describe('when in an environment that supports SubtleCrypto', () => {
    it('automatically uses the subtle crypto library', () => {
      // tslint:disable-next-line
      expect(signatureProvider['cryptoProvider']).toBeInstanceOf(
        SubtleCryptoProvider,
      );
    });
  });
});
