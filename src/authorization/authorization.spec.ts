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
import permissionFixture from './fixtures/permission.json';
import listPermissionsFixture from './fixtures/list-permissions.json';
import authorizationResourceFixture from './fixtures/authorization-resource.json';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
const testOrgId = 'org_01HXYZ123ABC456DEF789ABC';
const testResourceId = 'resource_01HXYZ123ABC456DEF789ABC';

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

  describe('createOrganizationRole', () => {
    it('creates an organization role', async () => {
      fetchOnce(organizationRoleFixture, { status: 201 });

      const role = await workos.authorization.createOrganizationRole(
        testOrgId,
        {
          slug: 'org-admin',
          name: 'Org Admin',
          description: 'Organization administrator',
        },
      );

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
    it('returns both environment and organization roles', async () => {
      fetchOnce(listOrganizationRolesFixture);

      const { data, object } =
        await workos.authorization.listOrganizationRoles(testOrgId);

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles`,
      );
      expect(object).toEqual('list');
      expect(data).toHaveLength(3);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            slug: 'admin',
            type: 'EnvironmentRole',
          }),
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
        { permissions: ['org:read', 'org:write'] },
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
        { permissionSlug: 'billing:read' },
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
        { permissionSlug: 'members:invite' },
      );

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/roles/org-admin/permissions/members:invite`,
      );
    });
  });

  describe('createPermission', () => {
    it('creates a permission', async () => {
      fetchOnce(permissionFixture, { status: 201 });

      const permission = await workos.authorization.createPermission({
        slug: 'users:read',
        name: 'Read Users',
        description: 'Allows reading user data',
      });

      expect(fetchURL()).toContain('/authorization/permissions');
      expect(fetchBody()).toEqual({
        slug: 'users:read',
        name: 'Read Users',
        description: 'Allows reading user data',
      });
      expect(permission).toMatchObject({
        object: 'permission',
        id: 'perm_01HXYZ123ABC456DEF789GHI',
        slug: 'users:read',
        name: 'Read Users',
        description: 'Allows reading user data',
        system: false,
      });
    });

    it('creates a permission without description', async () => {
      fetchOnce({ ...permissionFixture, description: null }, { status: 201 });

      const permission = await workos.authorization.createPermission({
        slug: 'users:read',
        name: 'Read Users',
      });

      expect(fetchBody()).toEqual({
        slug: 'users:read',
        name: 'Read Users',
      });
      expect(permission.description).toBeNull();
    });
  });

  describe('listPermissions', () => {
    it('returns permissions', async () => {
      fetchOnce(listPermissionsFixture);

      const { data, object, listMetadata } =
        await workos.authorization.listPermissions();

      expect(fetchURL()).toContain('/authorization/permissions');
      expect(object).toEqual('list');
      expect(data).toHaveLength(2);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            object: 'permission',
            id: 'perm_01HXYZ123ABC456DEF789GHI',
            slug: 'users:read',
            name: 'Read Users',
          }),
          expect.objectContaining({
            object: 'permission',
            id: 'perm_01HXYZ123ABC456DEF789GHJ',
            slug: 'users:write',
            name: 'Write Users',
          }),
        ]),
      );
      expect(listMetadata).toEqual({
        before: null,
        after: 'perm_01HXYZ123ABC456DEF789GHJ',
      });
    });

    it('passes pagination parameters', async () => {
      fetchOnce(listPermissionsFixture);

      await workos.authorization.listPermissions({
        limit: 10,
        after: 'perm_01HXYZ123ABC456DEF789GHI',
        order: 'desc',
      });

      expect(fetchSearchParams()).toEqual({
        limit: '10',
        after: 'perm_01HXYZ123ABC456DEF789GHI',
        order: 'desc',
      });
    });
  });

  describe('getPermission', () => {
    it('gets a permission by slug', async () => {
      fetchOnce(permissionFixture);

      const permission = await workos.authorization.getPermission('users:read');

      expect(fetchURL()).toContain('/authorization/permissions/users:read');
      expect(permission).toMatchObject({
        object: 'permission',
        id: 'perm_01HXYZ123ABC456DEF789GHI',
        slug: 'users:read',
        name: 'Read Users',
        description: 'Allows reading user data',
        system: false,
      });
    });
  });

  describe('updatePermission', () => {
    it('updates a permission', async () => {
      const updatedPermissionFixture = {
        ...permissionFixture,
        name: 'Read All Users',
        description: 'Updated description',
      };
      fetchOnce(updatedPermissionFixture);

      const permission = await workos.authorization.updatePermission(
        'users:read',
        {
          name: 'Read All Users',
          description: 'Updated description',
        },
      );

      expect(fetchURL()).toContain('/authorization/permissions/users:read');
      expect(fetchBody()).toEqual({
        name: 'Read All Users',
        description: 'Updated description',
      });
      expect(permission).toMatchObject({
        name: 'Read All Users',
        description: 'Updated description',
      });
    });

    it('clears description when set to null', async () => {
      const updatedPermissionFixture = {
        ...permissionFixture,
        description: null,
      };
      fetchOnce(updatedPermissionFixture);

      const permission = await workos.authorization.updatePermission(
        'users:read',
        {
          description: null,
        },
      );

      expect(fetchBody()).toEqual({
        description: null,
      });
      expect(permission.description).toBeNull();
    });
  });

  describe('deletePermission', () => {
    it('deletes a permission', async () => {
      fetchOnce({}, { status: 204 });

      await workos.authorization.deletePermission('users:read');

      expect(fetchURL()).toContain('/authorization/permissions/users:read');
    });
  });

  describe('getResource', () => {
    it('gets an authorization resource by internal ID', async () => {
      fetchOnce(authorizationResourceFixture);

      const resource = await workos.authorization.getResource(testResourceId);

      expect(fetchURL()).toContain(
        `/authorization/resources/${testResourceId}`,
      );
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        description: 'Financial report for Q4 2025',
        resourceType: 'document',
        organizationId: testOrgId,
        parentResourceId: 'resource_01HXYZ123ABC456DEF789XYZ',
      });
    });

    it('handles resource without parent', async () => {
      fetchOnce({ ...authorizationResourceFixture, parent_resource_id: null });

      const resource = await workos.authorization.getResource(testResourceId);

      expect(resource.parentResourceId).toBeNull();
    });
  });

  describe('createResource', () => {
    it('creates an authorization resource with all fields', async () => {
      fetchOnce(authorizationResourceFixture, { status: 201 });

      const resource = await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        description: 'Financial report for Q4 2025',
        parentResourceId: 'resource_01HXYZ123ABC456DEF789XYZ',
      });

      expect(fetchURL()).toContain('/authorization/resources');
      expect(fetchBody()).toEqual({
        organization_id: testOrgId,
        resource_type_slug: 'document',
        external_id: 'doc-456',
        name: 'Q4 Budget Report',
        description: 'Financial report for Q4 2025',
        parent_resource_id: 'resource_01HXYZ123ABC456DEF789XYZ',
      });
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        resourceType: 'document',
      });
    });

    it('creates an authorization resource with required fields only', async () => {
      fetchOnce(
        {
          ...authorizationResourceFixture,
          description: null,
          parent_resource_id: null,
        },
        { status: 201 },
      );

      const resource = await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
      });

      expect(fetchBody()).toEqual({
        organization_id: testOrgId,
        resource_type_slug: 'document',
        external_id: 'doc-456',
        name: 'Q4 Budget Report',
      });
      expect(resource.description).toBeNull();
      expect(resource.parentResourceId).toBeNull();
    });
  });

  describe('updateResource', () => {
    it('updates resource name', async () => {
      const updatedResourceFixture = {
        ...authorizationResourceFixture,
        name: 'Updated Report Name',
      };
      fetchOnce(updatedResourceFixture);

      const resource = await workos.authorization.updateResource({
        resourceId: testResourceId,
        name: 'Updated Report Name',
      });

      expect(fetchURL()).toContain(
        `/authorization/resources/${testResourceId}`,
      );
      expect(fetchBody()).toEqual({
        name: 'Updated Report Name',
      });
      expect(resource.name).toBe('Updated Report Name');
    });

    it('updates resource description', async () => {
      const updatedResourceFixture = {
        ...authorizationResourceFixture,
        description: 'Updated description',
      };
      fetchOnce(updatedResourceFixture);

      const resource = await workos.authorization.updateResource({
        resourceId: testResourceId,
        description: 'Updated description',
      });

      expect(fetchBody()).toEqual({
        description: 'Updated description',
      });
      expect(resource.description).toBe('Updated description');
    });

    it('clears description when set to null', async () => {
      const updatedResourceFixture = {
        ...authorizationResourceFixture,
        description: null,
      };
      fetchOnce(updatedResourceFixture);

      const resource = await workos.authorization.updateResource({
        resourceId: testResourceId,
        description: null,
      });

      expect(fetchBody()).toEqual({
        description: null,
      });
      expect(resource.description).toBeNull();
    });

    it('updates both name and description', async () => {
      const updatedResourceFixture = {
        ...authorizationResourceFixture,
        name: 'New Name',
        description: 'New Description',
      };
      fetchOnce(updatedResourceFixture);

      const resource = await workos.authorization.updateResource({
        resourceId: testResourceId,
        name: 'New Name',
        description: 'New Description',
      });

      expect(fetchBody()).toEqual({
        name: 'New Name',
        description: 'New Description',
      });
      expect(resource.name).toBe('New Name');
      expect(resource.description).toBe('New Description');
    });
  });

  describe('deleteResource', () => {
    it('deletes an authorization resource', async () => {
      fetchOnce({}, { status: 204 });

      await workos.authorization.deleteResource(testResourceId);

      expect(fetchURL()).toContain(
        `/authorization/resources/${testResourceId}`,
      );
    });
  });

  // ============================================================
  // FGA Authorization (Advanced RBAC)
  // ============================================================

  describe('authorization', () => {
    const authorizationResourceFixture = {
      object: 'authorization_resource',
      id: 'authz_resource_01HXYZ123ABC456DEF789GHI',
      external_id: 'doc-1',
      name: 'Document 1',
      description: 'A test document',
      resource_type: 'document',
      organization_id: 'org_01HXYZ123ABC456DEF789ABC',
      parent_resource_id: null,
      created_at: '2024-01-15T09:30:00.000Z',
      updated_at: '2024-01-15T09:30:00.000Z',
    };

    describe('getResource', () => {
      it('gets a resource by id', async () => {
        fetchOnce(authorizationResourceFixture);

        const resource = await workos.authorization.getResource(
          'authz_resource_01HXYZ123ABC456DEF789GHI',
        );

        expect(fetchURL()).toContain(
          '/authorization/resources/authz_resource_01HXYZ123ABC456DEF789GHI',
        );
        expect(resource).toMatchObject({
          object: 'authorization_resource',
          id: 'authz_resource_01HXYZ123ABC456DEF789GHI',
          externalId: 'doc-1',
          name: 'Document 1',
          description: 'A test document',
          resourceType: 'document',
          organizationId: 'org_01HXYZ123ABC456DEF789ABC',
          parentResourceId: null,
        });
      });

      it('deserializes all fields correctly', async () => {
        const fixtureWithParent = {
          ...authorizationResourceFixture,
          parent_resource_id: 'authz_resource_parent_123',
        };
        fetchOnce(fixtureWithParent);

        const resource = await workos.authorization.getResource(
          'authz_resource_01HXYZ123ABC456DEF789GHI',
        );

        expect(resource.parentResourceId).toBe('authz_resource_parent_123');
        expect(resource.createdAt).toBe('2024-01-15T09:30:00.000Z');
        expect(resource.updatedAt).toBe('2024-01-15T09:30:00.000Z');
      });
    });

    describe('createResource', () => {
      it('creates a resource with all options', async () => {
        const fixtureWithParent = {
          ...authorizationResourceFixture,
          parent_resource_id: 'authz_resource_parent_123',
        };
        fetchOnce(fixtureWithParent, { status: 201 });

        const resource = await workos.authorization.createResource({
          organizationId: 'org_01HXYZ123ABC456DEF789ABC',
          resourceTypeSlug: 'document',
          externalId: 'doc-1',
          name: 'Document 1',
          description: 'A test document',
          parentResourceId: 'authz_resource_parent_123',
        });

        expect(fetchURL()).toContain('/authorization/resources');
        expect(fetchBody()).toEqual({
          organization_id: 'org_01HXYZ123ABC456DEF789ABC',
          resource_type_slug: 'document',
          external_id: 'doc-1',
          name: 'Document 1',
          description: 'A test document',
          parent_resource_id: 'authz_resource_parent_123',
        });
        expect(resource.externalId).toBe('doc-1');
        expect(resource.parentResourceId).toBe('authz_resource_parent_123');
      });

      it('creates a resource with only required fields', async () => {
        const minimalFixture = {
          ...authorizationResourceFixture,
          description: null,
          parent_resource_id: null,
        };
        fetchOnce(minimalFixture, { status: 201 });

        const resource = await workos.authorization.createResource({
          organizationId: 'org_01HXYZ123ABC456DEF789ABC',
          resourceTypeSlug: 'document',
          externalId: 'doc-2',
          name: 'Document 2',
        });

        expect(fetchBody()).toEqual({
          organization_id: 'org_01HXYZ123ABC456DEF789ABC',
          resource_type_slug: 'document',
          external_id: 'doc-2',
          name: 'Document 2',
        });
        expect(resource.description).toBeNull();
        expect(resource.parentResourceId).toBeNull();
      });
    });

    describe('updateResource', () => {
      it('updates a resource name', async () => {
        const updatedFixture = {
          ...authorizationResourceFixture,
          name: 'Updated Document',
        };
        fetchOnce(updatedFixture);

        const resource = await workos.authorization.updateResource({
          resourceId: 'authz_resource_01HXYZ123ABC456DEF789GHI',
          name: 'Updated Document',
        });

        expect(fetchURL()).toContain(
          '/authorization/resources/authz_resource_01HXYZ123ABC456DEF789GHI',
        );
        expect(fetchBody()).toEqual({
          name: 'Updated Document',
        });
        expect(resource.name).toBe('Updated Document');
      });

      it('updates a resource description', async () => {
        const updatedFixture = {
          ...authorizationResourceFixture,
          description: 'Updated description',
        };
        fetchOnce(updatedFixture);

        const resource = await workos.authorization.updateResource({
          resourceId: 'authz_resource_01HXYZ123ABC456DEF789GHI',
          description: 'Updated description',
        });

        expect(fetchBody()).toEqual({
          description: 'Updated description',
        });
        expect(resource.description).toBe('Updated description');
      });

      it('clears description when set to null', async () => {
        const updatedFixture = {
          ...authorizationResourceFixture,
          description: null,
        };
        fetchOnce(updatedFixture);

        const resource = await workos.authorization.updateResource({
          resourceId: 'authz_resource_01HXYZ123ABC456DEF789GHI',
          description: null,
        });

        expect(fetchBody()).toEqual({
          description: null,
        });
        expect(resource.description).toBeNull();
      });

      it('updates both name and description', async () => {
        const updatedFixture = {
          ...authorizationResourceFixture,
          name: 'New Name',
          description: 'New Description',
        };
        fetchOnce(updatedFixture);

        const resource = await workos.authorization.updateResource({
          resourceId: 'authz_resource_01HXYZ123ABC456DEF789GHI',
          name: 'New Name',
          description: 'New Description',
        });

        expect(fetchBody()).toEqual({
          name: 'New Name',
          description: 'New Description',
        });
        expect(resource.name).toBe('New Name');
        expect(resource.description).toBe('New Description');
      });
    });

    describe('deleteResource', () => {
      it('deletes a resource', async () => {
        fetchOnce({}, { status: 204 });

        await workos.authorization.deleteResource(
          'authz_resource_01HXYZ123ABC456DEF789GHI',
        );

        expect(fetchURL()).toContain(
          '/authorization/resources/authz_resource_01HXYZ123ABC456DEF789GHI',
        );
      });
    });
  });
});
