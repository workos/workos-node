import fetch from 'jest-fetch-mock';
import {
  fetchOnce,
  fetchURL,
  fetchSearchParams,
  fetchBody,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import environmentRoleFixture from './fixtures/environment-role.json';
import listEnvironmentRolesFixture from './fixtures/list-environment-roles.json';
import organizationRoleFixture from './fixtures/organization-role.json';
import listOrganizationRolesFixture from './fixtures/list-organization-roles.json';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
const testOrgId = 'org_01HXYZ123ABC456DEF789ABC';

describe('Authorization', () => {
  beforeEach(() => fetch.resetMocks());

  describe('createEnvironmentRole', () => {
    it('creates an environment role', async () => {
      fetchOnce(environmentRoleFixture, { status: 201 });

      const role = await workos.authorization.createEnvironmentRole({
        slug: 'admin',
        name: 'Admin',
        description: 'Full administrative access',
      });

      expect(fetchURL()).toContain('/authorization/roles');
      expect(fetchBody()).toEqual({
        slug: 'admin',
        name: 'Admin',
        description: 'Full administrative access',
      });
      expect(role).toMatchObject({
        object: 'role',
        id: 'role_01HXYZ123ABC456DEF789GHI',
        slug: 'admin',
        name: 'Admin',
        description: 'Full administrative access',
        type: 'EnvironmentRole',
      });
      expect(role.permissions).toEqual(
        expect.arrayContaining([
          'users:read',
          'users:write',
          'settings:manage',
        ]),
      );
    });

    it('creates an environment role without description', async () => {
      fetchOnce(
        { ...environmentRoleFixture, description: null },
        { status: 201 },
      );

      const role = await workos.authorization.createEnvironmentRole({
        slug: 'member',
        name: 'Member',
      });

      expect(fetchBody()).toEqual({
        slug: 'member',
        name: 'Member',
      });
      expect(role.description).toBeNull();
    });
  });

  describe('listEnvironmentRoles', () => {
    it('returns environment roles', async () => {
      fetchOnce(listEnvironmentRolesFixture);

      const { data, object } =
        await workos.authorization.listEnvironmentRoles();

      expect(fetchURL()).toContain('/authorization/roles');
      expect(object).toEqual('list');
      expect(data).toHaveLength(2);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            object: 'role',
            id: 'role_01HXYZ123ABC456DEF789GHI',
            slug: 'admin',
            name: 'Admin',
            type: 'EnvironmentRole',
          }),
          expect.objectContaining({
            object: 'role',
            id: 'role_01HXYZ123ABC456DEF789GHJ',
            slug: 'member',
            name: 'Member',
            type: 'EnvironmentRole',
          }),
        ]),
      );
    });

    it('passes expand parameter', async () => {
      fetchOnce(listEnvironmentRolesFixture);

      await workos.authorization.listEnvironmentRoles({
        expand: 'permissions',
      });

      expect(fetchSearchParams()).toEqual({
        expand: 'permissions',
      });
    });
  });

  describe('getEnvironmentRole', () => {
    it('gets an environment role by slug', async () => {
      fetchOnce(environmentRoleFixture);

      const role = await workos.authorization.getEnvironmentRole('admin');

      expect(fetchURL()).toContain('/authorization/roles/admin');
      expect(role).toMatchObject({
        object: 'role',
        id: 'role_01HXYZ123ABC456DEF789GHI',
        slug: 'admin',
        name: 'Admin',
        description: 'Full administrative access',
        type: 'EnvironmentRole',
      });
    });
  });

  describe('updateEnvironmentRole', () => {
    it('updates an environment role', async () => {
      const updatedRoleFixture = {
        ...environmentRoleFixture,
        name: 'Super Admin',
        description: 'Updated description',
      };
      fetchOnce(updatedRoleFixture);

      const role = await workos.authorization.updateEnvironmentRole('admin', {
        name: 'Super Admin',
        description: 'Updated description',
      });

      expect(fetchURL()).toContain('/authorization/roles/admin');
      expect(fetchBody()).toEqual({
        name: 'Super Admin',
        description: 'Updated description',
      });
      expect(role).toMatchObject({
        name: 'Super Admin',
        description: 'Updated description',
      });
    });

    it('clears description when set to null', async () => {
      const updatedRoleFixture = {
        ...environmentRoleFixture,
        description: null,
      };
      fetchOnce(updatedRoleFixture);

      const role = await workos.authorization.updateEnvironmentRole('admin', {
        description: null,
      });

      expect(fetchBody()).toEqual({
        description: null,
      });
      expect(role.description).toBeNull();
    });
  });

  describe('setEnvironmentRolePermissions', () => {
    it('sets permissions for an environment role', async () => {
      const updatedRoleFixture = {
        ...environmentRoleFixture,
        permissions: ['users:read', 'users:write'],
      };
      fetchOnce(updatedRoleFixture);

      const role = await workos.authorization.setEnvironmentRolePermissions(
        'admin',
        { permissions: ['users:read', 'users:write'] },
      );

      expect(fetchURL()).toContain('/authorization/roles/admin/permissions');
      expect(fetchBody()).toEqual({
        permissions: ['users:read', 'users:write'],
      });
      expect(role.permissions).toHaveLength(2);
      expect(role.permissions).toEqual(
        expect.arrayContaining(['users:read', 'users:write']),
      );
    });

    it('clears all permissions when given empty array', async () => {
      const updatedRoleFixture = { ...environmentRoleFixture, permissions: [] };
      fetchOnce(updatedRoleFixture);

      const role = await workos.authorization.setEnvironmentRolePermissions(
        'admin',
        { permissions: [] },
      );

      expect(fetchBody()).toEqual({
        permissions: [],
      });
      expect(role.permissions).toHaveLength(0);
    });
  });

  describe('addEnvironmentRolePermission', () => {
    it('adds a permission to an environment role', async () => {
      const updatedRoleFixture = {
        ...environmentRoleFixture,
        permissions: [
          'users:read',
          'users:write',
          'settings:manage',
          'billing:read',
        ],
      };
      fetchOnce(updatedRoleFixture);

      const role = await workos.authorization.addEnvironmentRolePermission(
        'admin',
        { permissionSlug: 'billing:read' },
      );

      expect(fetchURL()).toContain('/authorization/roles/admin/permissions');
      expect(fetchBody()).toEqual({
        slug: 'billing:read',
      });
      expect(role.permissions).toEqual(
        expect.arrayContaining(['billing:read']),
      );
    });
  });

  // === Organization Roles ===

  describe('createOrganizationRole', () => {
    it('creates an organization role', async () => {
      fetchOnce(organizationRoleFixture, { status: 201 });

      const role = await workos.authorization.createOrganizationRole({
        organizationId: testOrgId,
        slug: 'org-admin',
        name: 'Org Admin',
        description: 'Organization administrator',
      });

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles`,
      );
      expect(fetchBody()).toEqual({
        slug: 'org-admin',
        name: 'Org Admin',
        description: 'Organization administrator',
      });
      expect(role).toMatchObject({
        object: 'role',
        id: 'role_01HXYZ123ABC456DEF789ORG',
        slug: 'org-admin',
        name: 'Org Admin',
        type: 'OrganizationRole',
      });
    });
  });

  describe('listOrganizationRoles', () => {
    it('returns organization roles', async () => {
      fetchOnce(listOrganizationRolesFixture);

      const { data, object } = await workos.authorization.listOrganizationRoles(
        { organizationId: testOrgId },
      );

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles`,
      );
      expect(object).toEqual('list');
      expect(data).toHaveLength(2);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            slug: 'org-admin',
            type: 'OrganizationRole',
          }),
          expect.objectContaining({
            slug: 'org-member',
            type: 'OrganizationRole',
          }),
        ]),
      );
    });

    it('passes expand parameter', async () => {
      fetchOnce(listOrganizationRolesFixture);

      await workos.authorization.listOrganizationRoles({
        organizationId: testOrgId,
        expand: 'permissions',
      });

      expect(fetchSearchParams()).toEqual({
        expand: 'permissions',
      });
    });
  });

  describe('getOrganizationRole', () => {
    it('gets an organization role by slug', async () => {
      fetchOnce(organizationRoleFixture);

      const role = await workos.authorization.getOrganizationRole(
        testOrgId,
        'org-admin',
      );

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles/org-admin`,
      );
      expect(role).toMatchObject({
        object: 'role',
        slug: 'org-admin',
        type: 'OrganizationRole',
      });
    });
  });

  describe('updateOrganizationRole', () => {
    it('updates an organization role', async () => {
      const updatedRoleFixture = {
        ...organizationRoleFixture,
        name: 'Super Org Admin',
        description: 'Updated description',
      };
      fetchOnce(updatedRoleFixture);

      const role = await workos.authorization.updateOrganizationRole(
        testOrgId,
        'org-admin',
        {
          name: 'Super Org Admin',
          description: 'Updated description',
        },
      );

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles/org-admin`,
      );
      expect(fetchBody()).toEqual({
        name: 'Super Org Admin',
        description: 'Updated description',
      });
      expect(role).toMatchObject({
        name: 'Super Org Admin',
        description: 'Updated description',
      });
    });
  });

  describe('deleteOrganizationRole', () => {
    it('deletes an organization role', async () => {
      fetchOnce({}, { status: 204 });

      await workos.authorization.deleteOrganizationRole(testOrgId, 'org-admin');

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles/org-admin`,
      );
    });
  });

  describe('setOrganizationRolePermissions', () => {
    it('sets permissions for an organization role', async () => {
      const updatedRoleFixture = {
        ...organizationRoleFixture,
        permissions: ['org:read', 'org:write'],
      };
      fetchOnce(updatedRoleFixture);

      const role = await workos.authorization.setOrganizationRolePermissions(
        testOrgId,
        'org-admin',
        ['org:read', 'org:write'],
      );

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles/org-admin/permissions`,
      );
      expect(fetchBody()).toEqual({
        permissions: ['org:read', 'org:write'],
      });
      expect(role.permissions).toEqual(
        expect.arrayContaining(['org:read', 'org:write']),
      );
    });
  });

  describe('addOrganizationRolePermission', () => {
    it('adds a permission to an organization role', async () => {
      const updatedRoleFixture = {
        ...organizationRoleFixture,
        permissions: ['org:manage', 'members:invite', 'billing:read'],
      };
      fetchOnce(updatedRoleFixture);

      const role = await workos.authorization.addOrganizationRolePermission(
        testOrgId,
        'org-admin',
        'billing:read',
      );

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles/org-admin/permissions`,
      );
      expect(fetchBody()).toEqual({
        slug: 'billing:read',
      });
      expect(role.permissions).toEqual(
        expect.arrayContaining(['billing:read']),
      );
    });
  });

  describe('removeOrganizationRolePermission', () => {
    it('removes a permission from an organization role', async () => {
      fetchOnce({}, { status: 200 });

      await workos.authorization.removeOrganizationRolePermission(
        testOrgId,
        'org-admin',
        'members:invite',
      );

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles/org-admin/permissions/members:invite`,
      );
    });
  });
});
