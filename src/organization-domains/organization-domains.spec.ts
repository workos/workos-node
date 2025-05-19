import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL, fetchBody } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import getOrganizationDomainPending from './fixtures/get-organization-domain-pending.json';
import getOrganizationDomainVerified from './fixtures/get-organization-domain-verified.json';
import { OrganizationDomainState } from './interfaces';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('OrganizationDomains', () => {
  beforeEach(() => fetch.resetMocks());

  describe('get', () => {
    it('requests an Organization Domain', async () => {
      fetchOnce(getOrganizationDomainVerified);

      const subject = await workos.organizationDomains.get(
        'org_domain_01HCZRAP3TPQ0X0DKJHR32TATG',
      );

      expect(fetchURL()).toContain(
        '/organization_domains/org_domain_01HCZRAP3TPQ0X0DKJHR32TATG',
      );
      expect(subject.id).toEqual('org_domain_01HCZRAP3TPQ0X0DKJHR32TATG');
      expect(subject.domain).toEqual('workos.com');
      expect(subject.organizationId).toEqual('org_01JR8C1EHCRPV4B4XP4W2B9X1M');
      expect(subject.state).toEqual(OrganizationDomainState.Verified);
      expect(subject.verificationToken).toBeNull();
      expect(subject.verificationStrategy).toEqual('manual');
    });

    it('requests an Organization Domain', async () => {
      fetchOnce(getOrganizationDomainPending);

      const subject = await workos.organizationDomains.get(
        'org_domain_01HD50K7EPWCMNPGMKXKKE14XT',
      );

      expect(fetchURL()).toContain(
        '/organization_domains/org_domain_01HD50K7EPWCMNPGMKXKKE14XT',
      );
      expect(subject.id).toEqual('org_domain_01HD50K7EPWCMNPGMKXKKE14XT');
      expect(subject.domain).toEqual('workos.com');
      expect(subject.organizationId).toEqual('org_01JR8C1EHCRPV4B4XP4W2B9X1M');
      expect(subject.state).toEqual(OrganizationDomainState.Pending);
      expect(subject.verificationToken).toEqual('F06PGMsZIO0shrveGWuGxgCj7');
      expect(subject.verificationStrategy).toEqual('dns');
    });
  });

  describe('verify', () => {
    it('start Organization Domain verification flow', async () => {
      fetchOnce(getOrganizationDomainPending);

      const subject = await workos.organizationDomains.verify(
        'org_domain_01HD50K7EPWCMNPGMKXKKE14XT',
      );

      expect(fetchURL()).toContain(
        '/organization_domains/org_domain_01HD50K7EPWCMNPGMKXKKE14XT/verify',
      );
      expect(subject.id).toEqual('org_domain_01HD50K7EPWCMNPGMKXKKE14XT');
      expect(subject.domain).toEqual('workos.com');
      expect(subject.organizationId).toEqual('org_01JR8C1EHCRPV4B4XP4W2B9X1M');
      expect(subject.state).toEqual(OrganizationDomainState.Pending);
      expect(subject.verificationToken).toEqual('F06PGMsZIO0shrveGWuGxgCj7');
      expect(subject.verificationStrategy).toEqual('dns');
    });
  });

  describe('create', () => {
    it('creates an Organization Domain', async () => {
      fetchOnce(getOrganizationDomainPending);

      const subject = await workos.organizationDomains.create({
        organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        domain: 'workos.com',
      });

      expect(fetchURL()).toContain('/organization_domains');
      expect(fetchBody()).toEqual({
        domain: 'workos.com',
        organization_id: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
      });

      expect(subject.id).toEqual('org_domain_01HD50K7EPWCMNPGMKXKKE14XT');
      expect(subject.domain).toEqual('workos.com');
      expect(subject.organizationId).toEqual('org_01JR8C1EHCRPV4B4XP4W2B9X1M');
      expect(subject.state).toEqual(OrganizationDomainState.Pending);
      expect(subject.verificationToken).toEqual('F06PGMsZIO0shrveGWuGxgCj7');
      expect(subject.verificationStrategy).toEqual('dns');
    });
  });
});
