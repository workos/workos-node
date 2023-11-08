import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { WorkOS } from '../workos';
import organizationMembershipFixture from './fixtures/organization-membership.json';
import listOrganizationMembershipsFixture from './fixtures/list-organization-memberships.json';

const mock = new MockAdapter(axios);
const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
const organizationMembershipId =
  'organization_membership_01H5JQDV7R7ATEYZDEG0W5PRYS';

describe('UserManagement', () => {
  afterEach(() => mock.resetHistory());

  describe('getOrganizationMembership', () => {
    it('sends a Get OrganizationMembership request', async () => {
      mock
        .onGet(`/organization_memberships/${organizationMembershipId}`)
        .reply(200, organizationMembershipFixture);
      const organizationMembership =
        await workos.organizationMemberships.getOrganizationMembership(
          organizationMembershipId,
        );
      expect(mock.history.get[0].url).toEqual(
        `/organization_memberships/${organizationMembershipId}`,
      );
      expect(organizationMembership).toMatchObject({
        object: 'organization_membership',
        id: 'organization_membership_01H5JQDV7R7ATEYZDEG0W5PRYS',
        userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
      });
    });
  });

  describe('listOrganizationMemberships', () => {
    it('lists organization memberships', async () => {
      mock
        .onGet('/organization_memberships')
        .reply(200, listOrganizationMembershipsFixture);
      const organizationMembershipsList =
        await workos.organizationMemberships.listOrganizationMemberships({
          organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
          userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        });
      expect(mock.history.get[0].url).toEqual('/organization_memberships');
      expect(organizationMembershipsList).toMatchObject({
        object: 'list',
        data: [
          {
            object: 'organization_membership',
            organizationId: 'organization_01H5JQDV7R7ATEYZDEG0W5PRYS',
            userId: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
          },
        ],
        listMetadata: {
          before: null,
          after: null,
        },
      });
    });

    it('sends the correct params when filtering', async () => {
      mock.onGet('/users').reply(200, listOrganizationMembershipsFixture);
      await workos.organizationMemberships.listOrganizationMemberships({
        userId: 'user_someuser',
        organizationId: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
      });

      expect(mock.history.get[0].params).toEqual({
        userId: 'user_someuser',
        organizationId: 'org_someorg',
        after: 'user_01H5JQDV7R7ATEYZDEG0W5PRYS',
        limit: 10,
        order: 'desc',
      });
    });
  });
});
