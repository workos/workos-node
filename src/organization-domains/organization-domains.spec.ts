import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { WorkOS } from '../workos';
import getOrganizationDomainPending from './fixtures/get-organization-domain-pending.json';
import getOrganizationDomainVerified from './fixtures/get-organization-domain-verified.json';
import { OrganizationDomainState } from './interfaces';

const mock = new MockAdapter(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('OrganizationDomains', () => {
  afterEach(() => mock.resetHistory());

  describe('get', () => {
    it('requests an Organization Domain', async () => {
      mock
        .onGet('/organization_domains/org_domain_01HCZRAP3TPQ0X0DKJHR32TATG')
        .replyOnce(200, getOrganizationDomainVerified);

      const subject = await workos.organizationDomains.get(
        'org_domain_01HCZRAP3TPQ0X0DKJHR32TATG',
      );

      expect(mock.history.get[0].url).toEqual(
        '/organization_domains/org_domain_01HCZRAP3TPQ0X0DKJHR32TATG',
      );
      expect(subject.id).toEqual('org_domain_01HCZRAP3TPQ0X0DKJHR32TATG');
      expect(subject.domain).toEqual('workos.com');
      expect(subject.state).toEqual(OrganizationDomainState.Verified);
      expect(subject.verificationToken).toBeNull();
      expect(subject.verificationStrategy).toEqual('manual');
    });

    it('requests an Organization Domain', async () => {
      mock
        .onGet('/organization_domains/org_domain_01HD50K7EPWCMNPGMKXKKE14XT')
        .replyOnce(200, getOrganizationDomainPending);

      const subject = await workos.organizationDomains.get(
        'org_domain_01HD50K7EPWCMNPGMKXKKE14XT',
      );

      expect(mock.history.get[0].url).toEqual(
        '/organization_domains/org_domain_01HD50K7EPWCMNPGMKXKKE14XT',
      );
      expect(subject.id).toEqual('org_domain_01HD50K7EPWCMNPGMKXKKE14XT');
      expect(subject.domain).toEqual('workos.com');
      expect(subject.state).toEqual(OrganizationDomainState.Pending);
      expect(subject.verificationToken).toEqual('F06PGMsZIO0shrveGWuGxgCj7');
      expect(subject.verificationStrategy).toEqual('dns');
    });
  });

  describe('verify', () => {
    it('start Organization Domain verification flow', async () => {
      mock
        .onPost(
          '/organization_domains/org_domain_01HD50K7EPWCMNPGMKXKKE14XT/verify',
        )
        .replyOnce(200, getOrganizationDomainPending);

      const subject = await workos.organizationDomains.verify(
        'org_domain_01HD50K7EPWCMNPGMKXKKE14XT',
      );

      expect(mock.history.post[0].url).toEqual(
        '/organization_domains/org_domain_01HD50K7EPWCMNPGMKXKKE14XT/verify',
      );
      expect(subject.id).toEqual('org_domain_01HD50K7EPWCMNPGMKXKKE14XT');
      expect(subject.domain).toEqual('workos.com');
      expect(subject.state).toEqual(OrganizationDomainState.Pending);
      expect(subject.verificationToken).toEqual('F06PGMsZIO0shrveGWuGxgCj7');
      expect(subject.verificationStrategy).toEqual('dns');
    });
  });

  describe('create', () => {
    it('creates an Organization Domain', async () => {
      mock
        .onPost('/organization_domains', {
          domain: 'workos.com',
          organization_id: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        })
        .replyOnce(200, getOrganizationDomainPending);

      const subject = await workos.organizationDomains.create({
        organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        domain: 'workos.com',
      });

      expect(mock.history.post[0].url).toEqual('/organization_domains');
      expect(JSON.parse(mock.history.post[0].data)).toMatchObject({
        domain: 'workos.com',
        organization_id: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
      });

      expect(subject.id).toEqual('org_domain_01HD50K7EPWCMNPGMKXKKE14XT');
      expect(subject.domain).toEqual('workos.com');
      expect(subject.state).toEqual(OrganizationDomainState.Pending);
      expect(subject.verificationToken).toEqual('F06PGMsZIO0shrveGWuGxgCj7');
      expect(subject.verificationStrategy).toEqual('dns');
    });
  });
});
