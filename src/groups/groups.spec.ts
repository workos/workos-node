import fetch from 'jest-fetch-mock';
import {
  fetchBody,
  fetchMethod,
  fetchOnce,
  fetchSearchParams,
  fetchURL,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import groupFixture from './fixtures/group.json';
import listGroupOrganizationMembershipsFixture from './fixtures/list-group-organization-memberships.json';
import listGroupsFixture from './fixtures/list-groups.json';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

const organizationId = 'org_01EHT88Z8J8795GZNQ4ZP1J81T';
const groupId = 'group_01HXYZ123456789ABCDEFGHIJ';
const organizationMembershipId = 'om_01HXYZ123456789ABCDEFGHIJ';

describe('Groups', () => {
  beforeEach(() => fetch.resetMocks());

  describe('createGroup', () => {
    it('creates a group', async () => {
      fetchOnce(groupFixture, { status: 201 });

      const group = await workos.groups.createGroup({
        organizationId,
        name: 'Engineering',
        description: 'The engineering team',
      });

      expect(fetchURL()).toContain(`/organizations/${organizationId}/groups`);
      expect(fetchMethod()).toEqual('POST');
      expect(fetchBody()).toEqual({
        name: 'Engineering',
        description: 'The engineering team',
      });
      expect(group).toEqual({
        object: 'group',
        id: groupId,
        organizationId,
        name: 'Engineering',
        description: 'The engineering team',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('listGroups', () => {
    it('returns groups for the organization', async () => {
      fetchOnce(listGroupsFixture);

      const { data, listMetadata } = await workos.groups.listGroups({
        organizationId,
      });

      expect(fetchURL()).toContain(`/organizations/${organizationId}/groups`);
      expect(fetchSearchParams()).toEqual({ order: 'desc' });
      expect(data).toHaveLength(2);
      expect(listMetadata).toEqual({
        before: null,
        after: 'group_01HXYZ123456789ABCDEFGHIK',
      });
      expect(data[0]).toEqual({
        object: 'group',
        id: groupId,
        organizationId,
        name: 'Engineering',
        description: 'The engineering team',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('forwards pagination options to the API', async () => {
      fetchOnce(listGroupsFixture);

      await workos.groups.listGroups({
        organizationId,
        after: 'group_after_id',
        limit: 10,
      });

      expect(fetchSearchParams()).toEqual({
        after: 'group_after_id',
        limit: '10',
        order: 'desc',
      });
    });

    it('does not include organizationId in pagination query params on recursion', async () => {
      const fixtureWithAfter = {
        ...listGroupsFixture,
        list_metadata: { after: 'group_next_page' },
      };
      const fixtureWithoutAfter = {
        ...listGroupsFixture,
        list_metadata: { after: null },
      };
      fetchOnce(fixtureWithAfter);
      fetchOnce(fixtureWithAfter);
      fetchOnce(fixtureWithoutAfter);

      const result = await workos.groups.listGroups({ organizationId });
      await result.autoPagination();

      const thirdCallUrl = fetch.mock.calls[2][0];
      const thirdCallParams = Object.fromEntries(
        new URL(String(thirdCallUrl)).searchParams,
      );
      expect(thirdCallParams).not.toHaveProperty('organizationId');
      expect(thirdCallParams).toHaveProperty('after', 'group_next_page');
    });
  });

  describe('getGroup', () => {
    it('requests a group', async () => {
      fetchOnce(groupFixture);

      const group = await workos.groups.getGroup({ organizationId, groupId });

      expect(fetchURL()).toContain(
        `/organizations/${organizationId}/groups/${groupId}`,
      );
      expect(fetchMethod()).toEqual('GET');
      expect(group.id).toEqual(groupId);
    });
  });

  describe('updateGroup', () => {
    it('updates a group', async () => {
      fetchOnce(groupFixture);

      const group = await workos.groups.updateGroup({
        organizationId,
        groupId,
        name: 'Renamed',
        description: null,
      });

      expect(fetchURL()).toContain(
        `/organizations/${organizationId}/groups/${groupId}`,
      );
      expect(fetchMethod()).toEqual('PATCH');
      expect(fetchBody()).toEqual({ name: 'Renamed', description: null });
      expect(group.id).toEqual(groupId);
    });
  });

  describe('deleteGroup', () => {
    it('sends a delete request', async () => {
      fetchOnce({}, { status: 204 });

      await workos.groups.deleteGroup({ organizationId, groupId });

      expect(fetchURL()).toContain(
        `/organizations/${organizationId}/groups/${groupId}`,
      );
      expect(fetchMethod()).toEqual('DELETE');
    });
  });

  describe('addOrganizationMembership', () => {
    it('adds an organization membership to a group', async () => {
      fetchOnce(groupFixture);

      const group = await workos.groups.addOrganizationMembership({
        organizationId,
        groupId,
        organizationMembershipId,
      });

      expect(fetchURL()).toContain(
        `/organizations/${organizationId}/groups/${groupId}/organization-memberships`,
      );
      expect(fetchMethod()).toEqual('POST');
      expect(fetchBody()).toEqual({
        organization_membership_id: organizationMembershipId,
      });
      expect(group.id).toEqual(groupId);
    });
  });

  describe('listOrganizationMemberships', () => {
    it('returns organization memberships of the group', async () => {
      fetchOnce(listGroupOrganizationMembershipsFixture);

      const { data } = await workos.groups.listOrganizationMemberships({
        organizationId,
        groupId,
      });

      expect(fetchURL()).toContain(
        `/organizations/${organizationId}/groups/${groupId}/organization-memberships`,
      );
      expect(data).toHaveLength(1);
      expect(data[0]).toEqual({
        object: 'organization_membership',
        id: organizationMembershipId,
        organizationId,
        userId: 'user_01EHQTV6MWP9P1F4ZXGXMC8ABB',
        status: 'active',
        directoryManaged: false,
        customAttributes: { department: 'Engineering' },
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('forwards pagination options to the API', async () => {
      fetchOnce(listGroupOrganizationMembershipsFixture);

      await workos.groups.listOrganizationMemberships({
        organizationId,
        groupId,
        limit: 25,
      });

      expect(fetchSearchParams()).toEqual({
        limit: '25',
        order: 'desc',
      });
    });
  });

  describe('removeOrganizationMembership', () => {
    it('sends a delete request', async () => {
      fetchOnce({}, { status: 204 });

      await workos.groups.removeOrganizationMembership({
        organizationId,
        groupId,
        organizationMembershipId,
      });

      expect(fetchURL()).toContain(
        `/organizations/${organizationId}/groups/${groupId}/organization-memberships/${organizationMembershipId}`,
      );
      expect(fetchMethod()).toEqual('DELETE');
    });
  });
});
