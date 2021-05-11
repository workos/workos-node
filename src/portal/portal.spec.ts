import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';
import { WorkOS } from '../workos';
import generateLinkInvalid from './fixtures/generate-link-invalid.json';
import generateLink from './fixtures/generate-link.json';
import { GeneratePortalLinkIntent } from './interfaces/generate-portal-link-intent.interface';

const mock = new MockAdapater(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Portal', () => {
  afterEach(() => mock.resetHistory());

  describe('generateLink', () => {
    describe('with a valid organization', () => {
      describe('with the sso intent', () => {
        it('returns an Admin Portal link', async () => {
          mock.onPost().reply(201, generateLink);

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.SSO,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(link).toEqual(
            'https://id.workos.com/portal/launch?secret=secret',
          );
        });
      });

      describe('with the dsync intent', () => {
        it('returns an Admin Portal link', async () => {
          mock.onPost().reply(201, generateLink);

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.DSync,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(link).toEqual(
            'https://id.workos.com/portal/launch?secret=secret',
          );
        });
      });
    });

    describe('with an invalid organization', () => {
      it('throws an error', async () => {
        mock.onPost().reply(400, generateLinkInvalid, {
          'X-Request-ID': 'a-request-id',
        });

        try {
          await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.SSO,
            organization: 'bogus-id',
            returnUrl: 'https://www.example.com',
          });
        } catch (error) {
          expect(error.message).toEqual(
            'Could not find an organization with the id, bogus-id.',
          );
        }
      });
    });
  });
});
