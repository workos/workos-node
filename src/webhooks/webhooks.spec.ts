import crypto from 'crypto';
import { WorkOS } from '../workos';
import mockWebhook from './fixtures/webhook.json';
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
import { SignatureVerificationException } from '../common/exceptions';

describe('Webhooks', () => {
  let payload: any;
  let secret: string;
  let timestamp: number;
  let unhashedString: string;
  let signatureHash: string;
  let expectation: object;

  beforeEach(() => {
    payload = mockWebhook;
    secret = 'secret';
    timestamp = Date.now() * 1000;
    unhashedString = `${timestamp}.${JSON.stringify(payload)}`;
    signatureHash = crypto
      .createHmac('sha256', secret)
      .update(unhashedString)
      .digest()
      .toString('hex');
    expectation = {
      id: 'directory_user_01FAEAJCR3ZBZ30D8BD1924TVG',
      state: 'active',
      emails: [
        {
          type: 'work',
          value: 'blair@foo-corp.com',
          primary: true,
        },
      ],
      idpId: '00u1e8mutl6wlH3lL4x7',
      object: 'directory_user',
      username: 'blair@foo-corp.com',
      lastName: 'Lunchford',
      firstName: 'Blair',
      jobTitle: 'Software Engineer',
      directoryId: 'directory_01F9M7F68PZP8QXP8G7X5QRHS7',
      createdAt: '2021-06-25T19:07:33.155Z',
      updatedAt: '2021-06-25T19:07:33.155Z',
      rawAttributes: {
        name: {
          givenName: 'Blair',
          familyName: 'Lunchford',
          middleName: 'Elizabeth',
          honorificPrefix: 'Ms.',
        },
        title: 'Software Engineer',
        active: true,
        emails: [
          {
            type: 'work',
            value: 'blair@foo-corp.com',
            primary: true,
          },
        ],
        groups: [],
        locale: 'en-US',
        schemas: [
          'urn:ietf:params:scim:schemas:core:2.0:User',
          'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
        ],
        userName: 'blair@foo-corp.com',
        addresses: [
          {
            region: 'CA',
            primary: true,
            locality: 'San Francisco',
            postalCode: '94016',
          },
        ],
        externalId: '00u1e8mutl6wlH3lL4x7',
        displayName: 'Blair Lunchford',
        'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
          manager: {
            value: '2',
            displayName: 'Kate Chapman',
          },
          division: 'Engineering',
          department: 'Customer Success',
        },
      },
    };
  });

  describe('constructEvent', () => {
    describe('with the correct payload, sig_header, and secret', () => {
      it('returns a webhook event', async () => {
        const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
        const options = { payload, sigHeader, secret };
        const webhook = await workos.webhooks.constructEvent(options);

        expect(webhook.data).toEqual(expectation);
        expect(webhook.event).toEqual('dsync.user.created');
        expect(webhook.id).toEqual('wh_123');
      });
    });

    describe('with the correct payload, sig_header, secret, and tolerance', () => {
      it('returns a webhook event', async () => {
        const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
        const options = { payload, sigHeader, secret, tolerance: 200 };
        const webhook = await workos.webhooks.constructEvent(options);

        expect(webhook.data).toEqual(expectation);
        expect(webhook.event).toEqual('dsync.user.created');
        expect(webhook.id).toEqual('wh_123');
      });
    });

    describe('with an empty header', () => {
      it('raises an error', async () => {
        const sigHeader = '';
        const options = { payload, sigHeader, secret };

        await expect(
          workos.webhooks.constructEvent(options),
        ).rejects.toThrowError(SignatureVerificationException);
      });
    });

    describe('with an empty signature hash', () => {
      it('raises an error', async () => {
        const sigHeader = `t=${timestamp}, v1=`;
        const options = { payload, sigHeader, secret };

        await expect(
          workos.webhooks.constructEvent(options),
        ).rejects.toThrowError(SignatureVerificationException);
      });
    });

    describe('with an incorrect signature hash', () => {
      it('raises an error', async () => {
        const sigHeader = `t=${timestamp}, v1=99999`;
        const options = { payload, sigHeader, secret };

        await expect(
          workos.webhooks.constructEvent(options),
        ).rejects.toThrowError(SignatureVerificationException);
      });
    });

    describe('with an incorrect payload', () => {
      it('raises an error', async () => {
        const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
        payload = 'invalid';
        const options = { payload, sigHeader, secret };

        await expect(
          workos.webhooks.constructEvent(options),
        ).rejects.toThrowError(SignatureVerificationException);
      });
    });

    describe('with an incorrect webhook secret', () => {
      it('raises an error', async () => {
        const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
        secret = 'invalid';
        const options = { payload, sigHeader, secret };

        await expect(
          workos.webhooks.constructEvent(options),
        ).rejects.toThrowError(SignatureVerificationException);
      });
    });

    describe('with a timestamp outside tolerance', () => {
      it('raises an error', async () => {
        const sigHeader = `t=9999, v1=${signatureHash}`;
        const options = { payload, sigHeader, secret };

        await expect(
          workos.webhooks.constructEvent(options),
        ).rejects.toThrowError(SignatureVerificationException);
      });
    });
  });

  describe('verifyHeader', () => {
    it('returns true when the signature is valid', async () => {
      const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
      const options = { payload, sigHeader, secret };
      const result = await workos.webhooks.verifyHeader(options);
      expect(result).toBeTruthy();
    });
  });

  describe('getTimestampAndSignatureHash', () => {
    it('returns the timestamp and signature when the signature is valid', () => {
      const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
      const timestampAndSignature =
        workos.webhooks.getTimestampAndSignatureHash(sigHeader);

      expect(timestampAndSignature).toEqual([
        timestamp.toString(),
        signatureHash,
      ]);
    });
  });

  describe('computeSignature', () => {
    it('returns the computed signature', async () => {
      const signature = await workos.webhooks.computeSignature(
        timestamp,
        payload,
        secret,
      );

      expect(signature).toEqual(signatureHash);
    });
  });
});
