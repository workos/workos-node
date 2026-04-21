import fetch from 'jest-fetch-mock';
import { fetchBody, fetchOnce } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import generateLinkInvalid from './fixtures/generate-link-invalid.json';
import portalLinkResponse from './fixtures/portal-link-response.json';
import { GenerateLinkIntent } from '../common/interfaces';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('AdminPortal', () => {
  beforeEach(() => fetch.resetMocks());

  describe('generateLink', () => {
    describe('with a valid organization', () => {
      describe('with the sso intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(portalLinkResponse, { status: 201 });

          const { link } = await workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.SSO,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GenerateLinkIntent.SSO,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://setup.workos.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          );
        });
      });

      describe('with the domain_verification intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(portalLinkResponse, { status: 201 });

          const { link } = await workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.DomainVerification,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GenerateLinkIntent.DomainVerification,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://setup.workos.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          );
        });
      });

      describe('with the dsync intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(portalLinkResponse, { status: 201 });

          const { link } = await workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.DSync,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GenerateLinkIntent.DSync,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://setup.workos.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          );
        });
      });

      describe('with the `audit_logs` intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(portalLinkResponse, { status: 201 });

          const { link } = await workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.AuditLogs,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GenerateLinkIntent.AuditLogs,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://setup.workos.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          );
        });
      });

      describe('with the `log_streams` intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(portalLinkResponse, { status: 201 });

          const { link } = await workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.LogStreams,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GenerateLinkIntent.LogStreams,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://setup.workos.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          );
        });
      });
      describe('with the `certificate_renewal` intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(portalLinkResponse, { status: 201 });

          const { link } = await workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.CertificateRenewal,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GenerateLinkIntent.CertificateRenewal,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://setup.workos.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          );
        });
      });
      describe('with the `bring_your_own_key` intent', () => {
        it('returns an Admin Portal link', async () => {
          fetchOnce(portalLinkResponse, { status: 201 });

          const { link } = await workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.BringYourOwnKey,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
          });

          expect(fetchBody()).toEqual({
            intent: GenerateLinkIntent.BringYourOwnKey,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
          });
          expect(link).toEqual(
            'https://setup.workos.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          );
        });
      });

      describe('with intentOptions and adminEmails', () => {
        it('serializes the new parameters correctly', async () => {
          fetchOnce(portalLinkResponse, { status: 201 });

          const { link } = await workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.SSO,
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            returnUrl: 'https://www.example.com',
            intentOptions: {
              sso: {
                bookmarkSlug: 'chatgpt',
                providerType: 'GoogleSAML',
              },
            },
            adminEmails: ['admin@example.com'],
          });

          expect(fetchBody()).toEqual({
            intent: 'sso',
            organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
            return_url: 'https://www.example.com',
            intent_options: {
              sso: {
                bookmark_slug: 'chatgpt',
                provider_type: 'GoogleSAML',
              },
            },
            admin_emails: ['admin@example.com'],
          });
          expect(link).toEqual(
            'https://setup.workos.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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
          workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.SSO,
            organization: 'bogus-id',
            returnUrl: 'https://www.example.com',
          }),
        ).rejects.toThrow(
          'Could not find an organization with the id, bogus-id.',
        );
        expect(fetchBody()).toEqual({
          intent: GenerateLinkIntent.SSO,
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
          workos.adminPortal.generateLink({
            intent: GenerateLinkIntent.SSO,
            organization: 'bogus-id',
            returnUrl: 'https://www.example.com',
          }),
        ).rejects.toThrow(
          'Could not find an organization with the id, bogus-id.',
        );
        expect(fetchBody()).toEqual({
          intent: GenerateLinkIntent.SSO,
          organization: 'bogus-id',
          return_url: 'https://www.example.com',
        });
      });
    });
  });
});
