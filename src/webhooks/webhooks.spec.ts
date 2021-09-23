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
    unhashedString = `${timestamp}.${payload}`;
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
      idp_id: '00u1e8mutl6wlH3lL4x7',
      object: 'directory_user',
      username: 'blair@foo-corp.com',
      last_name: 'Lunceford',
      first_name: 'Blair',
      directory_id: 'directory_01F9M7F68PZP8QXP8G7X5QRHS7',
      raw_attributes: {
        name: {
          givenName: 'Blair',
          familyName: 'Lunceford',
          middleName: 'Elizabeth',
          honorificPrefix: 'Ms.',
        },
        title: 'Developer Success Engineer',
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
            region: 'CO',
            primary: true,
            locality: 'Steamboat Springs',
            postalCode: '80487',
          },
        ],
        externalId: '00u1e8mutl6wlH3lL4x7',
        displayName: 'Blair Lunceford',
        'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
          manager: {
            value: '2',
            displayName: 'Kathleen Chung',
          },
          division: 'Engineering',
          department: 'Customer Success',
        },
      },
    };
  });

  describe('constructEvent', () => {
    describe('with the correct payload, sig_header, and secret', () => {
      it('returns a webhook event', () => {
        const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
        const webhook = workos.webhooks.constructEvent(
          payload,
          sigHeader,
          secret,
        );

        expect(webhook.data).toEqual(expectation);
        expect(webhook.event).toEqual('dsync.user.created');
        expect(webhook.id).toEqual('wh_123');
      });
    });
    describe('with the correct payload, sig_header, secret, and tolerance', () => {
      it('returns a webhook event', () => {
        const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
        const webhook = workos.webhooks.constructEvent(
          payload,
          sigHeader,
          secret,
          200,
        );

        expect(webhook.data).toEqual(expectation);
        expect(webhook.event).toEqual('dsync.user.created');
        expect(webhook.id).toEqual('wh_123');
      });
    });
    describe('with an empty header', () => {
      it('raises an error', () => {
        const sigHeader = '';
        expect(() =>
          workos.webhooks.constructEvent(payload, sigHeader, secret),
        ).toThrowError(SignatureVerificationException);
      });
    });
    describe('with an empty signature hash', () => {
      it('raises an error', () => {
        const sigHeader = `t=${timestamp}, v1=`;
        expect(() =>
          workos.webhooks.constructEvent(payload, sigHeader, secret),
        ).toThrowError(SignatureVerificationException);
      });
    });
    describe('with an incorrect signature hash', () => {
      it('raises an error', () => {
        const sigHeader = `t=${timestamp}, v1=99999`;
        expect(() =>
          workos.webhooks.constructEvent(payload, sigHeader, secret),
        ).toThrowError(SignatureVerificationException);
      });
    });
    describe('with an incorrect payload', () => {
      it('raises an error', () => {
        const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
        expect(() =>
          workos.webhooks.constructEvent(
            (payload = 'invalid'),
            sigHeader,
            secret,
          ),
        ).toThrowError(SignatureVerificationException);
      });
    });
    describe('with an incorrect webhook secret', () => {
      it('raises an error', () => {
        const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
        expect(() =>
          workos.webhooks.constructEvent(
            payload,
            sigHeader,
            (secret = 'invalid'),
          ),
        ).toThrowError(SignatureVerificationException);
      });
    });
    describe('with a timestamp outside tolerance', () => {
      it('raises an error', () => {
        const sigHeader = `t=${timestamp}, v1=${signatureHash}`;
        expect(() =>
          workos.webhooks.constructEvent(
            payload,
            sigHeader,
            (secret = 'invalid'),
          ),
        ).toThrowError(SignatureVerificationException);
      });
    });
  });
});
