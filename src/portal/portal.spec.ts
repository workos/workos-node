import fetch from 'jest-fetch-mock';
import { fetchBody, fetchOnce } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import generateLinkInvalid from './fixtures/generate-link-invalid.json';
import generateLink from './fixtures/generate-link.json';
import { GeneratePortalLinkIntent } from './interfaces/generate-portal-link-intent.interface';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('Portal', () => {
  beforeEach(() => fetch.resetMocks());

  describe('generateLink', () => {
    describe('with a valid organization', () => {
      describe('with the sso intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(generateLink, { status: 201 });

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.SSO,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GeneratePortalLinkIntent.SSO,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://id.workos.com/portal/launch?secret=secret',
          );
        });
      });

      describe('with the domain_verification intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(generateLink, { status: 201 });

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.DomainVerification,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GeneratePortalLinkIntent.DomainVerification,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://id.workos.com/portal/launch?secret=secret',
          );
        });
      });

      describe('with the dsync intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(generateLink, { status: 201 });

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.DSync,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GeneratePortalLinkIntent.DSync,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://id.workos.com/portal/launch?secret=secret',
          );
        });
      });

      describe('with the `audit_logs` intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(generateLink, { status: 201 });

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.AuditLogs,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GeneratePortalLinkIntent.AuditLogs,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://id.workos.com/portal/launch?secret=secret',
          );
        });
      });

      describe('with the `log_streams` intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(generateLink, { status: 201 });

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.LogStreams,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GeneratePortalLinkIntent.LogStreams,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://id.workos.com/portal/launch?secret=secret',
          );
        });
      });
      describe('with the `certificate_renewal` intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(generateLink, { status: 201 });

          const { link } = await workos.portal.generateLink({
            intent: GeneratePortalLinkIntent.CertificateRenewal,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GeneratePortalLinkIntent.CertificateRenewal,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://id.workos.com/portal/launch?secret=secret',
          );
        });
      });
    });

    describe('with an invalid organization', () => {
      it('throws an error', async () => {
        fetchOnce(generateLinkInvalid, {
          status: 400,
          headers: { 'X-Request-ID': 'a-request-id' },
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
        expect(fetchBody()).toEqual({
          intent: GeneratePortalLinkIntent.SSO,
          organization: 'bogus-id',
          return_url: 'https://www.example.com',
        });
      });
    });

    describe('with an invalid organization', () => {
      it('throws an error', async () => {
        fetchOnce(generateLinkInvalid, {
          status: 400,
          headers: { 'X-Request-ID': 'a-request-id' },
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
        expect(fetchBody()).toEqual({
          intent: GeneratePortalLinkIntent.SSO,
          organization: 'bogus-id',
          return_url: 'https://www.example.com',
        });
      });
    });
  });
});
