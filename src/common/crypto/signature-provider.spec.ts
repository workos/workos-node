import crypto from 'crypto';
import { SubtleCryptoProvider } from './subtle-crypto-provider';
import mockWebhook from '../../webhooks/fixtures/webhook.json';
import { SignatureProvider } from './signature-provider';

describe('SignatureProvider', () => {
  let payload: any;
  let secret: string;
  let timestamp: number;
  let signatureHash: string;
  const signatureProvider = new SignatureProvider(new SubtleCryptoProvider());

  beforeEach(() => {
    payload = mockWebhook;
    secret = 'secret';
    timestamp = Date.now();
    const unhashedString = `${timestamp}.${JSON.stringify(payload)}`;
    signatureHash = crypto
      .createHmac('sha256', secret)
      .update(unhashedString)
      .digest()
      .toString('hex');
  });

  describe('verifyHeader', () => {
    it.each([
      'not-a-timestamp',
      '',
      '123junk',
      'Infinity',
      '1e12',
      '1.5',
      '9007199254740992',
    ])('rejects malformed timestamp %s', async (value) => {
      const hash = await signatureProvider.computeSignature(
        value,
        payload,
        secret,
      );
      await expect(
        signatureProvider.verifyHeader({
          payload,
          secret,
          sigHeader: `t=${value},v1=${hash}`,
        }),
      ).rejects.toThrow('Invalid timestamp');
    });

    it.each([-180000, 0, 180000])(
      'accepts timestamp offset %s within tolerance',
      async (offset) => {
        const now = 1791600000000;
        jest.spyOn(Date, 'now').mockReturnValue(now);
        const value = String(now + offset);
        const hash = await signatureProvider.computeSignature(
          value,
          payload,
          secret,
        );
        await expect(
          signatureProvider.verifyHeader({
            payload,
            secret,
            sigHeader: `t=${value},v1=${hash}`,
            tolerance: 180000,
          }),
        ).resolves.toBe(true);
      },
    );

    it.each([-180001, 180001])(
      'rejects timestamp offset %s outside tolerance',
      async (offset) => {
        const now = 1791600000000;
        jest.spyOn(Date, 'now').mockReturnValue(now);
        const value = String(now + offset);
        const hash = await signatureProvider.computeSignature(
          value,
          payload,
          secret,
        );
        await expect(
          signatureProvider.verifyHeader({
            payload,
            secret,
            sigHeader: `t=${value},v1=${hash}`,
            tolerance: 180000,
          }),
        ).rejects.toThrow('Timestamp outside the tolerance zone');
      },
    );

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
