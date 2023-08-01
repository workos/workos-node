import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { WorkOS } from '../workos';
import generateLinkInvalid from './fixtures/generate-link-invalid.json';
import generateLink from './fixtures/generate-link.json';
import { GeneratePortalLinkIntent } from './interfaces/generate-portal-link-intent.interface';

const mock = new MockAdapter(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Portal', () => {
  afterEach(() => mock.resetHistory());

  describe('generateLink', () => {
    describe('with a valid organization', () => {
      describe('with the sso intent', () => {
        it('returns an Admin Portal link', async () => {
          mock
            .onPost('/portal/generate_link', {
              intent: GeneratePortalLinkIntent.SSO,
              organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
              return_url: 'https://www.example.com',
            })
            .replyOnce(201, generateLink);

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
          mock
            .onPost('/portal/generate_link', {
              intent: GeneratePortalLinkIntent.DSync,
              organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
              return_url: 'https://www.example.com',
            })
            .reply(201, generateLink);

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

      describe('with the `audit_logs` intent', () => {
        it('returns an Admin Portal link', async () => {
          mock
            .onPost('/portal/generate_link', {
              intent: GeneratePortalLinkIntent.AuditLogs,
              organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
              return_url: 'https://www.example.com',
            })
            .reply(201, generateLink);

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.AuditLogs,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(link).toEqual(
            'https://id.workos.com/portal/launch?secret=secret',
          );
        });
      });

      describe('with the `log_streams` intent', () => {
        it('returns an Admin Portal link', async () => {
          mock
            .onPost('/portal/generate_link', {
              intent: GeneratePortalLinkIntent.LogStreams,
              organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
              return_url: 'https://www.example.com',
            })
            .reply(201, generateLink);

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.LogStreams,
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
        mock
          .onPost('/portal/generate_link', {
            intent: GeneratePortalLinkIntent.SSO,
            organization: 'bogus-id',
            return_url: 'https://www.example.com',
          })
          .reply(400, generateLinkInvalid, {
            'X-Request-ID': 'a-request-id',
          });

        await expect(
          workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.SSO,
            organization: 'bogus-id',
            returnUrl: 'https://www.example.com',
          }),
        ).rejects.toThrowError(
          'Could not find an organization with the id, bogus-id.',
        );
      });
    });
  });
});
