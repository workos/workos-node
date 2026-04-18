import fetch from 'jest-fetch-mock';
import { fetchBody, fetchOnce } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import portalLinkResponse from './fixtures/portal-link-response.fixture.json';
import generateLinkInvalid from './fixtures/generate-link-invalid.fixture.json';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('AdminPortal', () => {
  beforeEach(() => fetch.resetMocks());

  describe('generateLink', () => {
    describe('with the sso intent', () => {
      it('returns an Admin Portal link', async () => {
        fetchOnce(portalLinkResponse, { status: 201 });

        const { link } = await workos.adminPortal.generateLink({
          intent: 'sso',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          returnUrl: 'https://www.example.com',
        });

        expect(fetchBody()).toEqual({
          intent: 'sso',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          return_url: 'https://www.example.com',
        });
        expect(link).toBeDefined();
      });
    });

    describe('with the dsync intent', () => {
      it('returns an Admin Portal link', async () => {
        fetchOnce(portalLinkResponse, { status: 201 });

        const { link } = await workos.adminPortal.generateLink({
          intent: 'dsync',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          returnUrl: 'https://www.example.com',
        });

        expect(fetchBody()).toEqual({
          intent: 'dsync',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          return_url: 'https://www.example.com',
        });
        expect(link).toBeDefined();
      });
    });

    describe('with the audit_logs intent', () => {
      it('returns an Admin Portal link', async () => {
        fetchOnce(portalLinkResponse, { status: 201 });

        const { link } = await workos.adminPortal.generateLink({
          intent: 'audit_logs',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          returnUrl: 'https://www.example.com',
        });

        expect(fetchBody()).toEqual({
          intent: 'audit_logs',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          return_url: 'https://www.example.com',
        });
        expect(link).toBeDefined();
      });
    });

    describe('with the log_streams intent', () => {
      it('returns an Admin Portal link', async () => {
        fetchOnce(portalLinkResponse, { status: 201 });

        const { link } = await workos.adminPortal.generateLink({
          intent: 'log_streams',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          returnUrl: 'https://www.example.com',
        });

        expect(fetchBody()).toEqual({
          intent: 'log_streams',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          return_url: 'https://www.example.com',
        });
        expect(link).toBeDefined();
      });
    });

    describe('with the domain_verification intent', () => {
      it('returns an Admin Portal link', async () => {
        fetchOnce(portalLinkResponse, { status: 201 });

        const { link } = await workos.adminPortal.generateLink({
          intent: 'domain_verification',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          returnUrl: 'https://www.example.com',
        });

        expect(fetchBody()).toEqual({
          intent: 'domain_verification',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          return_url: 'https://www.example.com',
        });
        expect(link).toBeDefined();
      });
    });

    describe('with the certificate_renewal intent', () => {
      it('returns an Admin Portal link', async () => {
        fetchOnce(portalLinkResponse, { status: 201 });

        const { link } = await workos.adminPortal.generateLink({
          intent: 'certificate_renewal',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          returnUrl: 'https://www.example.com',
        });

        expect(fetchBody()).toEqual({
          intent: 'certificate_renewal',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          return_url: 'https://www.example.com',
        });
        expect(link).toBeDefined();
      });
    });

    describe('with the bring_your_own_key intent', () => {
      it('returns an Admin Portal link', async () => {
        fetchOnce(portalLinkResponse, { status: 201 });

        const { link } = await workos.adminPortal.generateLink({
          intent: 'bring_your_own_key',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          returnUrl: 'https://www.example.com',
        });

        expect(fetchBody()).toEqual({
          intent: 'bring_your_own_key',
          organization: 'org_01EHQMYV6MBK39QC5PZXHY59C3',
          return_url: 'https://www.example.com',
        });
        expect(link).toBeDefined();
      });
    });

    describe('with intentOptions and adminEmails', () => {
      it('serializes the new parameters correctly', async () => {
        fetchOnce(portalLinkResponse, { status: 201 });

        const { link } = await workos.adminPortal.generateLink({
          intent: 'sso',
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
        expect(link).toBeDefined();
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
            intent: 'sso',
            organization: 'bogus-id',
            returnUrl: 'https://www.example.com',
          }),
        ).rejects.toThrow(
          'Could not find an organization with the id, bogus-id.',
        );
        expect(fetchBody()).toEqual({
          intent: 'sso',
          organization: 'bogus-id',
          return_url: 'https://www.example.com',
        });
      });
    });
  });
});
