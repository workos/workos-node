import crypto from 'crypto';
import { NodeCryptoProvider } from './NodeCryptoProvider';
import { SubtleCryptoProvider } from './SubtleCryptoProvider';
import mockWebhook from '../../webhooks/fixtures/webhook.json';
import { SignatureProvider } from './SignatureProvider';

describe('CryptoProvider', () => {
  let payload: any;
  let secret: string;
  let timestamp: number;
  let signatureHash: string;

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

  describe('when computing HMAC signature', () => {
    it('returns the same for the Node crypto and Web Crypto versions', async () => {
      const nodeCryptoProvider = new NodeCryptoProvider();
      const subtleCryptoProvider = new SubtleCryptoProvider();

      const stringifiedPayload = JSON.stringify(payload);
      const payloadHMAC = `${timestamp}.${stringifiedPayload}`;

      const nodeCompare = await nodeCryptoProvider.computeHMACSignatureAsync(
        payloadHMAC,
        secret,
      );
      const subtleCompare =
        await subtleCryptoProvider.computeHMACSignatureAsync(
          payloadHMAC,
          secret,
        );

      expect(nodeCompare).toEqual(subtleCompare);
    });
  });

  describe('when securely comparing', () => {
    it('returns the same for the Node crypto and Web Crypto versions', async () => {
      const nodeCryptoProvider = new NodeCryptoProvider();
      const subtleCryptoProvider = new SubtleCryptoProvider();
      const signatureProvider = new SignatureProvider(subtleCryptoProvider);

      const signature = await signatureProvider.computeSignature(
        timestamp,
        payload,
        secret,
      );

      expect(
        nodeCryptoProvider.secureCompare(signature, signatureHash),
      ).toEqual(subtleCryptoProvider.secureCompare(signature, signatureHash));

      expect(nodeCryptoProvider.secureCompare(signature, 'foo')).toEqual(
        subtleCryptoProvider.secureCompare(signature, 'foo'),
      );
    });
  });
});
