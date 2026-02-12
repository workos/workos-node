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
import listResourcesFixture from './fixtures/list-resources.json';
import roleAssignmentFixture from './fixtures/role-assignment.json';
import listRoleAssignmentsFixture from './fixtures/list-role-assignments.json';
import listOrganizationMembershipsForResourceFixture from './fixtures/list-organization-memberships-for-resource.json';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
const testOrgId = 'org_01HXYZ123ABC456DEF789ABC';
const testResourceId = 'authz_resource_01HXYZ123ABC456DEF789ABC';
const testOrgMembershipId = 'om_01HXYZ123ABC456DEF789ABC';
const testRoleAssignmentId = 'role_assignment_01HXYZ123ABC456DEF789ABC';

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
        resourceTypeSlug: 'document',
        organizationId: testOrgId,
        parentResourceId: 'authz_resource_01HXYZ123ABC456DEF789XYZ',
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      });
    });

    it('handles resource without parent', async () => {
      fetchOnce({ ...authorizationResourceFixture, parent_resource_id: null });

      const resource = await workos.authorization.getResource(testResourceId);

      expect(resource.parentResourceId).toBeNull();
      expect(resource.description).not.toBeNull();
    });

    it('handles resource without description', async () => {
      fetchOnce({ ...authorizationResourceFixture, description: null });

      const resource = await workos.authorization.getResource(testResourceId);
      expect(resource.description).toBeNull();
      expect(resource.parentResourceId).not.toBeNull();
    });

    it('handles resource without parent and without description', async () => {
      fetchOnce({
        ...authorizationResourceFixture,
        parent_resource_id: null,
        description: null,
      });

      const resource = await workos.authorization.getResource(testResourceId);

      expect(resource.parentResourceId).toBeNull();
      expect(resource.description).toBeNull();
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
        parentResourceId: 'authz_resource_01HXYZ123ABC456DEF789XYZ',
      });

      expect(fetchURL()).toContain('/authorization/resources');
      expect(fetchBody()).toEqual({
        organization_id: testOrgId,
        resource_type_slug: 'document',
        external_id: 'doc-456',
        name: 'Q4 Budget Report',
        description: 'Financial report for Q4 2025',
        parent_resource_id: 'authz_resource_01HXYZ123ABC456DEF789XYZ',
      });
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        description: 'Financial report for Q4 2025',
        resourceTypeSlug: 'document',
        parentResourceId: 'authz_resource_01HXYZ123ABC456DEF789XYZ',
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      });
    });

    it('creates an authorization resource with parentResourceId', async () => {
      fetchOnce(authorizationResourceFixture, { status: 201 });

      const resource = await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        parentResourceId: 'resource_01HXYZ',
      });

      expect(fetchBody()).toEqual({
        organization_id: testOrgId,
        resource_type_slug: 'document',
        external_id: 'doc-456',
        name: 'Q4 Budget Report',
        parent_resource_id: 'resource_01HXYZ',
      });
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        resourceTypeSlug: 'document',
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      });
    });

    it('creates an authorization resource with description and parentResourceId', async () => {
      fetchOnce(authorizationResourceFixture, { status: 201 });

      const resource = await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        description: 'Financial report for Q4 2025',
        parentResourceId: 'resource_01HXYZ',
      });

      expect(fetchBody()).toEqual({
        organization_id: testOrgId,
        resource_type_slug: 'document',
        external_id: 'doc-456',
        name: 'Q4 Budget Report',
        description: 'Financial report for Q4 2025',
        parent_resource_id: 'resource_01HXYZ',
      });
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        description: 'Financial report for Q4 2025',
        resourceTypeSlug: 'document',
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      });
    });

    it('creates an authorization resource with parent resource but no description', async () => {
      fetchOnce(
        {
          ...authorizationResourceFixture,
          description: null,
        },
        { status: 201 },
      );

      const resource = await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        parentResourceId: 'authz_resource_01HXYZ123ABC456DEF789XYZ',
      });

      expect(fetchBody()).toEqual({
        organization_id: testOrgId,
        resource_type_slug: 'document',
        external_id: 'doc-456',
        name: 'Q4 Budget Report',
        parent_resource_id: 'authz_resource_01HXYZ123ABC456DEF789XYZ',
      });
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        description: null,
        resourceTypeSlug: 'document',
        parentResourceId: 'authz_resource_01HXYZ123ABC456DEF789XYZ',
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      });
    });

    it('excludes description when omitted', async () => {
      fetchOnce(authorizationResourceFixture, { status: 201 });

      await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        parentResourceId: 'resource_01HXYZ',
      });

      const body = fetchBody();
      expect(body).not.toHaveProperty('description');
      expect(body).toHaveProperty('parent_resource_id', 'resource_01HXYZ');
    });

    it('sends null when description is explicitly set to null', async () => {
      fetchOnce(
        {
          ...authorizationResourceFixture,
          description: null,
        },
        { status: 201 },
      );

      await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        description: null,
        parentResourceId: 'resource_01HXYZ',
      });

      const body = fetchBody();
      expect(body).toHaveProperty('description', null);
      expect(body).toHaveProperty('parent_resource_id', 'resource_01HXYZ');
    });

    it('creates a resource with parentResourceExternalId and parentResourceTypeSlug', async () => {
      fetchOnce(authorizationResourceFixture, { status: 201 });

      const resource = await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        parentResourceExternalId: 'folder-123',
        parentResourceTypeSlug: 'folder',
      });

      expect(fetchURL()).toContain('/authorization/resources');
      expect(fetchBody()).toEqual({
        organization_id: testOrgId,
        resource_type_slug: 'document',
        external_id: 'doc-456',
        name: 'Q4 Budget Report',
        parent_resource_external_id: 'folder-123',
        parent_resource_type_slug: 'folder',
      });
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
      });
    });

    it('excludes parentResourceExternalId and parentResourceTypeSlug when parentResourceId is used', async () => {
      fetchOnce(authorizationResourceFixture, { status: 201 });

      await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        parentResourceId: 'resource_01HXYZ',
      });

      const body = fetchBody();
      expect(body).toHaveProperty('parent_resource_id', 'resource_01HXYZ');
      expect(body).not.toHaveProperty('parent_resource_external_id');
      expect(body).not.toHaveProperty('parent_resource_type_slug');
    });

    it('excludes parentResourceId when parentResourceExternalId is used', async () => {
      fetchOnce(authorizationResourceFixture, { status: 201 });

      await workos.authorization.createResource({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        parentResourceExternalId: 'folder-123',
        parentResourceTypeSlug: 'folder',
      });

      const body = fetchBody();
      expect(body).toHaveProperty('parent_resource_external_id', 'folder-123');
      expect(body).toHaveProperty('parent_resource_type_slug', 'folder');
      expect(body).not.toHaveProperty('parent_resource_id');
    });
  });

  describe('updateResource', () => {
    it('updates name when description is omitted', async () => {
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
      const body = fetchBody();
      expect(body).toEqual({ name: 'Updated Report Name' });
      expect(body).not.toHaveProperty('description');
      expect(resource.name).toBe('Updated Report Name');
      expect(resource.description).toBe('Financial report for Q4 2025');
    });

    it('updates description when name is omitted', async () => {
      const updatedResourceFixture = {
        ...authorizationResourceFixture,
        description: 'Updated description',
      };
      fetchOnce(updatedResourceFixture);

      const resource = await workos.authorization.updateResource({
        resourceId: testResourceId,
        description: 'Updated description',
      });

      const body = fetchBody();
      expect(body).toEqual({ description: 'Updated description' });
      expect(body).not.toHaveProperty('name');
      expect(resource.description).toBe('Updated description');
      expect(resource.name).toBe('Q4 Budget Report');
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

      const body = fetchBody();
      expect(body).toEqual({ description: null });
      expect(body).not.toHaveProperty('name');
      expect(resource.description).toBeNull();
    });

    it('excludes description from request body when undefined', async () => {
      fetchOnce(authorizationResourceFixture);

      await workos.authorization.updateResource({
        resourceId: testResourceId,
        name: 'Some Name',
      });

      const body = fetchBody();
      expect(body).not.toHaveProperty('description');
    });
  });

  describe('deleteResource', () => {
    it('deletes an authorization resource', async () => {
      fetchOnce({}, { status: 204 });

      await workos.authorization.deleteResource({ resourceId: testResourceId });

      expect(fetchURL()).toContain(
        `/authorization/resources/${testResourceId}`,
      );
      expect(fetchSearchParams()).toEqual({});
    });

    it('deletes a resource with cascadeDelete=true', async () => {
      fetchOnce({}, { status: 204 });

      await workos.authorization.deleteResource({
        resourceId: testResourceId,
        cascadeDelete: true,
      });

      expect(fetchURL()).toContain(
        `/authorization/resources/${testResourceId}`,
      );
      expect(fetchSearchParams()).toEqual({ cascade_delete: 'true' });
    });

    it('deletes a resource with cascadeDelete=false', async () => {
      fetchOnce({}, { status: 204 });

      await workos.authorization.deleteResource({
        resourceId: testResourceId,
        cascadeDelete: false,
      });

      expect(fetchURL()).toContain(
        `/authorization/resources/${testResourceId}`,
      );
      expect(fetchSearchParams()).toEqual({ cascade_delete: 'false' });
    });
  });

  describe('listResources', () => {
    it('returns a paginated list of resources', async () => {
      fetchOnce(listResourcesFixture);

      const { data, object, listMetadata } =
        await workos.authorization.listResources();

      expect(fetchURL()).toContain('/authorization/resources');
      expect(object).toEqual('list');
      expect(data).toHaveLength(2);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            object: 'authorization_resource',
            id: 'authz_resource_01HXYZ123ABC456DEF789ABC',
            externalId: 'doc-12345678',
            name: 'Q5 Budget Report',
            resourceTypeSlug: 'document',
          }),
          expect.objectContaining({
            object: 'authorization_resource',
            id: 'authz_resource_01HXYZ123ABC456DEF789DEF',
            externalId: 'folder-123',
            name: 'Finance Folder',
            resourceTypeSlug: 'folder',
          }),
        ]),
      );
      expect(listMetadata).toEqual({
        before: null,
        after: 'authz_resource_01HXYZ123ABC456DEF789DEF',
      });
    });

    it('passes pagination parameters with after cursor', async () => {
      fetchOnce(listResourcesFixture);

      await workos.authorization.listResources({
        limit: 10,
        after: 'resource_01HXYZ123ABC456DEF789ABC',
        order: 'desc',
      });

      expect(fetchSearchParams()).toEqual({
        limit: '10',
        after: 'resource_01HXYZ123ABC456DEF789ABC',
        order: 'desc',
      });
    });

    it('passes pagination parameters with before cursor', async () => {
      fetchOnce(listResourcesFixture);

      await workos.authorization.listResources({
        limit: 10,
        before: 'resource_01HXYZ123ABC456DEF789DEF',
        order: 'asc',
      });

      expect(fetchSearchParams()).toEqual({
        limit: '10',
        before: 'resource_01HXYZ123ABC456DEF789DEF',
        order: 'asc',
      });
    });

    it('passes parent resource filters', async () => {
      fetchOnce(listResourcesFixture);

      await workos.authorization.listResources({
        parentResourceId: 'resource_01HXYZ123ABC456DEF789XYZ',
      });

      expect(fetchSearchParams()).toEqual({
        parent_resource_id: 'resource_01HXYZ123ABC456DEF789XYZ',
      });
    });

    it('passes parent external ID filters', async () => {
      fetchOnce(listResourcesFixture);

      await workos.authorization.listResources({
        parentResourceTypeSlug: 'folder',
        parentExternalId: 'folder-123',
      });

      expect(fetchSearchParams()).toEqual({
        parent_resource_type_slug: 'folder',
        parent_external_id: 'folder-123',
      });
    });

    it('passes search filter', async () => {
      fetchOnce(listResourcesFixture);

      await workos.authorization.listResources({
        search: 'Budget',
      });

      expect(fetchSearchParams()).toEqual({
        search: 'Budget',
      });
    });
  });

  describe('getResourceByExternalId', () => {
    it('gets a resource by organization, type, and external ID', async () => {
      fetchOnce(authorizationResourceFixture);

      const resource = await workos.authorization.getResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
      });

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/resources/document/doc-456`,
      );
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        resourceTypeSlug: 'document',
        organizationId: testOrgId,
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      });
    });

    it('handles resource without parent', async () => {
      fetchOnce({ ...authorizationResourceFixture, parent_resource_id: null });

      const resource = await workos.authorization.getResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
      });

      expect(resource.parentResourceId).toBeNull();
    });

    it('handles resource without description', async () => {
      fetchOnce({ ...authorizationResourceFixture, description: null });

      const resource = await workos.authorization.getResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
      });

      expect(resource.description).toBeNull();
    });
  });

  describe('updateResourceByExternalId', () => {
    it('updates a resource by external ID', async () => {
      const updatedResourceFixture = {
        ...authorizationResourceFixture,
        name: 'Updated Report Name',
        description: 'Updated description',
      };
      fetchOnce(updatedResourceFixture);

      const resource = await workos.authorization.updateResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'Updated Report Name',
        description: 'Updated description',
      });

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/resources/document/doc-456`,
      );
      expect(fetchBody()).toEqual({
        name: 'Updated Report Name',
        description: 'Updated description',
      });
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Updated Report Name',
        description: 'Updated description',
        resourceTypeSlug: 'document',
        organizationId: testOrgId,
      });
    });

    it('updates only name when description is omitted', async () => {
      const updatedResourceFixture = {
        ...authorizationResourceFixture,
        name: 'New Name',
      };
      fetchOnce(updatedResourceFixture);

      await workos.authorization.updateResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        name: 'New Name',
      });

      const body = fetchBody();
      expect(body).toEqual({ name: 'New Name' });
      expect(body).not.toHaveProperty('description');
    });

    it('updates only description when name is omitted', async () => {
      const updatedResourceFixture = {
        ...authorizationResourceFixture,
        description: 'new description',
      };
      fetchOnce(updatedResourceFixture);

      await workos.authorization.updateResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        description: 'new description',
      });

      const body = fetchBody();
      expect(body).toEqual({ description: 'new description' });
      expect(body).not.toHaveProperty('name');
    });

    it('returns unchanged resource when body is empty', async () => {
      fetchOnce(authorizationResourceFixture);

      const resource = await workos.authorization.updateResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
      });

      expect(fetchBody()).toEqual({});
      expect(resource).toMatchObject({
        object: 'authorization_resource',
        id: testResourceId,
        externalId: 'doc-456',
        name: 'Q4 Budget Report',
        description: 'Financial report for Q4 2025',
        resourceTypeSlug: 'document',
        organizationId: testOrgId,
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      });
    });

    it('clears description when set to null', async () => {
      const updatedResourceFixture = {
        ...authorizationResourceFixture,
        description: null,
      };
      fetchOnce(updatedResourceFixture);

      const resource = await workos.authorization.updateResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        description: null,
      });

      expect(fetchBody()).toEqual({ description: null });
      expect(resource.description).toBeNull();
    });
  });

  describe('deleteResourceByExternalId', () => {
    it('deletes a resource by external ID', async () => {
      fetchOnce({}, { status: 204 });
      const resourceTypeSlug = 'document';
      const externalId = 'externalId';

      await workos.authorization.deleteResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: resourceTypeSlug,
        externalId: externalId,
      });

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/resources/${resourceTypeSlug}/${externalId}`,
      );
      expect(fetchSearchParams()).toEqual({});
    });

    it('deletes a resource with cascadeDelete=true', async () => {
      fetchOnce({}, { status: 204 });
      const resourceTypeSlug = 'document';
      const externalId = 'externalId';

      await workos.authorization.deleteResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: resourceTypeSlug,
        externalId: externalId,
        cascadeDelete: true,
      });

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/resources/${resourceTypeSlug}/${externalId}`,
      );
      expect(fetchSearchParams()).toEqual({ cascade_delete: 'true' });
    });

    it('deletes a resource with cascadeDelete=false', async () => {
      fetchOnce({}, { status: 204 });
      const resourceTypeSlug = 'document';
      const externalId = 'externalId';

      await workos.authorization.deleteResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: resourceTypeSlug,
        externalId: externalId,
        cascadeDelete: false,
      });

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/resources/${resourceTypeSlug}/${externalId}`,
      );
      expect(fetchSearchParams()).toEqual({ cascade_delete: 'false' });
    });
  });

  describe('check', () => {
    it('returns authorized when permission is granted by resource ID', async () => {
      fetchOnce({ authorized: true }, { status: 200 });

      const result = await workos.authorization.check({
        organizationMembershipId: testOrgMembershipId,
        permissionSlug: 'documents:edit',
        resourceId: testResourceId,
      });

      expect(fetchURL()).toContain(
        `/authorization/organization_memberships/${testOrgMembershipId}/check`,
      );
      expect(fetchBody()).toEqual({
        permission_slug: 'documents:edit',
        resource_id: testResourceId,
      });
      expect(result).toEqual({ authorized: true });
    });

    it('returns authorized when permission is granted by resource external ID and type slug', async () => {
      fetchOnce({ authorized: true }, { status: 200 });

      const result = await workos.authorization.check({
        organizationMembershipId: testOrgMembershipId,
        permissionSlug: 'documents:edit',
        resourceExternalId: 'doc-456',
        resourceTypeSlug: 'document',
      });

      expect(fetchURL()).toContain(
        `/authorization/organization_memberships/${testOrgMembershipId}/check`,
      );
      expect(fetchBody()).toEqual({
        permission_slug: 'documents:edit',
        resource_external_id: 'doc-456',
        resource_type_slug: 'document',
      });
      expect(result).toEqual({ authorized: true });
    });

    it('returns unauthorized when permission is not granted by resource ID', async () => {
      fetchOnce({ authorized: false }, { status: 200 });

      const result = await workos.authorization.check({
        organizationMembershipId: testOrgMembershipId,
        permissionSlug: 'documents:delete',
        resourceId: testResourceId,
      });

      expect(result).toEqual({ authorized: false });
    });

    it('returns unauthorized when permission is not granted by resource external ID and type slug', async () => {
      fetchOnce({ authorized: false }, { status: 200 });

      const result = await workos.authorization.check({
        organizationMembershipId: testOrgMembershipId,
        permissionSlug: 'documents:delete',
        resourceExternalId: 'doc-456',
        resourceTypeSlug: 'document',
      });

      expect(result).toEqual({ authorized: false });
    });

    it('only includes provided resource identification fields when permission is granted by resource ID', async () => {
      fetchOnce({ authorized: true }, { status: 200 });

      await workos.authorization.check({
        organizationMembershipId: testOrgMembershipId,
        permissionSlug: 'documents:read',
        resourceId: testResourceId,
      });

      const body = fetchBody();
      expect(body).toEqual({
        permission_slug: 'documents:read',
        resource_id: testResourceId,
      });
      expect(body).toHaveProperty('resource_id', testResourceId);
      expect(body).not.toHaveProperty('resource_external_id');
      expect(body).not.toHaveProperty('resource_type_slug');
    });

    it('only includes provided resource identification fields when permission is granted by resource external ID and type slug', async () => {
      fetchOnce({ authorized: true }, { status: 200 });

      await workos.authorization.check({
        organizationMembershipId: testOrgMembershipId,
        permissionSlug: 'documents:read',
        resourceExternalId: 'doc-456',
        resourceTypeSlug: 'document',
      });

      const body = fetchBody();
      expect(body).toEqual({
        permission_slug: 'documents:read',
        resource_external_id: 'doc-456',
        resource_type_slug: 'document',
      });
      expect(body).not.toHaveProperty('resource_id');
      expect(body).toHaveProperty('resource_external_id', 'doc-456');
      expect(body).toHaveProperty('resource_type_slug', 'document');
    });
  });

  describe('listRoleAssignments', () => {
    it('lists role assignments for an organization membership', async () => {
      fetchOnce(listRoleAssignmentsFixture);

      const { data, object, listMetadata } =
        await workos.authorization.listRoleAssignments({
          organizationMembershipId: testOrgMembershipId,
        });

      expect(fetchURL()).toContain(
        `/authorization/organization_memberships/${testOrgMembershipId}/role_assignments`,
      );
      expect(object).toEqual('list');
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        object: 'role_assignment',
        id: 'role_assignment_01HXYZ123ABC456DEF789ABC',
        role: { slug: 'editor' },
        resource: {
          id: 'resource_01HXYZ123ABC456DEF789XYZ',
          externalId: 'doc-123',
          resourceTypeSlug: 'document',
        },
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      });
      expect(listMetadata).toEqual({
        before: null,
        after: 'role_assignment_01HXYZ123ABC456DEF789ABC',
      });
    });

    it('passes pagination parameters', async () => {
      fetchOnce(listRoleAssignmentsFixture);

      await workos.authorization.listRoleAssignments({
        organizationMembershipId: testOrgMembershipId,
        limit: 10,
        after: 'ra_cursor123',
        order: 'desc',
      });

      expect(fetchSearchParams()).toEqual({
        limit: '10',
        after: 'ra_cursor123',
        order: 'desc',
      });
    });

    it('passes before pagination parameter', async () => {
      fetchOnce(listRoleAssignmentsFixture);

      await workos.authorization.listRoleAssignments({
        organizationMembershipId: testOrgMembershipId,
        limit: 10,
        before: 'ra_cursor456',
        order: 'asc',
      });

      expect(fetchSearchParams()).toEqual({
        limit: '10',
        before: 'ra_cursor456',
        order: 'asc',
      });
    });
  });

  describe('assignRole', () => {
    it('assigns a role by resource ID', async () => {
      fetchOnce(roleAssignmentFixture, { status: 201 });

      const assignment = await workos.authorization.assignRole({
        organizationMembershipId: testOrgMembershipId,
        roleSlug: 'editor',
        resourceId: testResourceId,
      });

      expect(fetchURL()).toContain(
        `/authorization/organization_memberships/${testOrgMembershipId}/role_assignments`,
      );
      expect(fetchBody()).toEqual({
        role_slug: 'editor',
        resource_id: testResourceId,
      });
      expect(assignment).toMatchObject({
        object: 'role_assignment',
        id: 'role_assignment_01HXYZ123ABC456DEF789ABC',
        role: { slug: 'editor' },
        resource: {
          id: 'resource_01HXYZ123ABC456DEF789XYZ',
          externalId: 'doc-123',
          resourceTypeSlug: 'document',
        },
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      });
    });

    it('assigns a role by external ID & resourceTypeSlug', async () => {
      fetchOnce(roleAssignmentFixture, { status: 201 });

      const assignment = await workos.authorization.assignRole({
        organizationMembershipId: testOrgMembershipId,
        roleSlug: 'editor',
        resourceExternalId: 'doc-123',
        resourceTypeSlug: 'document',
      });

      expect(fetchBody()).toEqual({
        role_slug: 'editor',
        resource_external_id: 'doc-123',
        resource_type_slug: 'document',
      });
      expect(assignment.resource.externalId).toBe('doc-123');
      expect(assignment.createdAt).toBe('2024-01-15T09:30:00.000Z');
      expect(assignment.updatedAt).toBe('2024-01-15T09:30:00.000Z');
    });

    it('body only includes resource_id when resourceId is provided', async () => {
      fetchOnce(roleAssignmentFixture, { status: 201 });

      await workos.authorization.assignRole({
        organizationMembershipId: testOrgMembershipId,
        roleSlug: 'editor',
        resourceId: testResourceId,
      });

      const body = fetchBody();
      expect(body).toHaveProperty('resource_id');
      expect(body).not.toHaveProperty('resource_external_id');
      expect(body).not.toHaveProperty('resource_type_slug');
    });

    it('body only includes externalId and typeSlug when provided', async () => {
      fetchOnce(roleAssignmentFixture, { status: 201 });

      await workos.authorization.assignRole({
        organizationMembershipId: testOrgMembershipId,
        roleSlug: 'editor',
        resourceExternalId: 'doc-123',
        resourceTypeSlug: 'document',
      });

      const body = fetchBody();
      expect(body).not.toHaveProperty('resource_id');
      expect(body).toHaveProperty('resource_external_id');
      expect(body).toHaveProperty('resource_type_slug');
    });
  });

  describe('removeRole', () => {
    it('removes a role by resource ID', async () => {
      fetchOnce({}, { status: 204 });

      await workos.authorization.removeRole({
        organizationMembershipId: testOrgMembershipId,
        roleSlug: 'editor',
        resourceId: testResourceId,
      });

      expect(fetchURL()).toContain(
        `/authorization/organization_memberships/${testOrgMembershipId}/role_assignments`,
      );
      expect(fetchSearchParams()).toEqual({
        role_slug: 'editor',
        resource_id: testResourceId,
      });
    });

    it('removes a role by externalId and resourceTypeSlug', async () => {
      fetchOnce({}, { status: 204 });

      await workos.authorization.removeRole({
        organizationMembershipId: testOrgMembershipId,
        roleSlug: 'editor',
        resourceExternalId: 'doc-123',
        resourceTypeSlug: 'document',
      });

      expect(fetchSearchParams()).toEqual({
        role_slug: 'editor',
        resource_external_id: 'doc-123',
        resource_type_slug: 'document',
      });
    });

    it('query only includes resource_id when resourceId is provided', async () => {
      fetchOnce(roleAssignmentFixture, { status: 201 });

      await workos.authorization.removeRole({
        organizationMembershipId: testOrgMembershipId,
        roleSlug: 'editor',
        resourceId: testResourceId,
      });

      const params = fetchSearchParams();
      expect(params).toHaveProperty('resource_id');
      expect(params).not.toHaveProperty('resource_external_id');
      expect(params).not.toHaveProperty('resource_type_slug');
    });

    it('query only includes externalId and typeSlug when provided', async () => {
      fetchOnce(roleAssignmentFixture, { status: 201 });

      await workos.authorization.removeRole({
        organizationMembershipId: testOrgMembershipId,
        roleSlug: 'editor',
        resourceExternalId: 'doc-123',
        resourceTypeSlug: 'document',
      });

      const params = fetchSearchParams();
      expect(params).not.toHaveProperty('resource_id');
      expect(params).toHaveProperty('resource_external_id');
      expect(params).toHaveProperty('resource_type_slug');
    });
  });

  describe('removeRoleAssignment', () => {
    it('removes a role assignment by ID', async () => {
      fetchOnce({}, { status: 204 });

      await workos.authorization.removeRoleAssignment({
        organizationMembershipId: testOrgMembershipId,
        roleAssignmentId: testRoleAssignmentId,
      });

      expect(fetchURL()).toContain(
        `/authorization/organization_memberships/${testOrgMembershipId}/role_assignments/${testRoleAssignmentId}`,
      );
    });
  });

  describe('listResourcesForMembership', () => {
    it('lists resources with parentResourceId', async () => {
      fetchOnce(listResourcesFixture);

      const { data, object, listMetadata } =
        await workos.authorization.listResourcesForMembership({
          organizationMembershipId: testOrgMembershipId,
          permissionSlug: 'document:read',
          parentResourceId: testResourceId,
        });

      expect(fetchURL()).toContain(
        `/authorization/organization_memberships/${testOrgMembershipId}/resources`,
      );
      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'document:read',
        parent_resource_id: testResourceId,
      });
      expect(object).toEqual('list');
      expect(data).toHaveLength(2);
      expect(data[0]).toMatchObject({
        object: 'authorization_resource',
        id: 'authz_resource_01HXYZ123ABC456DEF789ABC',
      });
      expect(listMetadata).toEqual({
        before: null,
        after: 'authz_resource_01HXYZ123ABC456DEF789DEF',
      });
    });

    it('lists resources with parentResourceTypeSlug and parentResourceExternalId', async () => {
      fetchOnce(listResourcesFixture);

      await workos.authorization.listResourcesForMembership({
        organizationMembershipId: testOrgMembershipId,
        permissionSlug: 'document:read',
        parentResourceTypeSlug: 'document',
        parentResourceExternalId: 'doc-456',
      });

      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'document:read',
        parent_resource_type_slug: 'document',
        parent_resource_external_id: 'doc-456',
      });
    });

    it('passes pagination parameters', async () => {
      fetchOnce(listResourcesFixture);

      await workos.authorization.listResourcesForMembership({
        organizationMembershipId: testOrgMembershipId,
        permissionSlug: 'document:read',
        parentResourceId: testResourceId,
        limit: 10,
        after: 'resource_cursor123',
        order: 'desc',
      });

      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'document:read',
        parent_resource_id: testResourceId,
        limit: '10',
        after: 'resource_cursor123',
        order: 'desc',
      });
    });

    it('passes before cursor for backward pagination', async () => {
      fetchOnce(listResourcesFixture);

      await workos.authorization.listResourcesForMembership({
        organizationMembershipId: testOrgMembershipId,
        permissionSlug: 'document:read',
        parentResourceId: testResourceId,
        limit: 10,
        before: 'resource_cursor789',
        order: 'asc',
      });

      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'document:read',
        parent_resource_id: testResourceId,
        limit: '10',
        before: 'resource_cursor789',
        order: 'asc',
      });
    });
  });

  describe('listMembershipsForResource', () => {
    it('lists organization memberships for a resource by internal ID', async () => {
      fetchOnce(listOrganizationMembershipsForResourceFixture);

      const { data, object, listMetadata } =
        await workos.authorization.listMembershipsForResource({
          resourceId: testResourceId,
          permissionSlug: 'documents:read',
        });

      expect(fetchURL()).toContain(
        `/authorization/resources/${testResourceId}/organization_memberships`,
      );
      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'documents:read',
      });
      expect(object).toEqual('list');
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        object: 'organization_membership',
        id: 'om_01HXYZ123ABC456DEF789ABC',
        userId: 'user_01HXYZ123ABC456DEF789XYZ',
        organizationId: 'org_01HXYZ123ABC456DEF789ABC',
        organizationName: 'Acme Corp',
        status: 'active',
        customAttributes: { department: 'Engineering', level: 'senior' },
      });
      expect(listMetadata).toEqual({
        before: null,
        after: 'om_01HXYZ123ABC456DEF789ABC',
      });
    });

    it('returns empty list when no memberships match', async () => {
      const emptyFixture = {
        object: 'list',
        data: [],
        list_metadata: { before: null, after: null },
      };
      fetchOnce(emptyFixture);

      const { data, object, listMetadata } =
        await workos.authorization.listMembershipsForResource({
          resourceId: testResourceId,
          permissionSlug: 'documents:read',
        });

      expect(object).toEqual('list');
      expect(data).toHaveLength(0);
      expect(listMetadata).toEqual({ before: null, after: null });
    });

    it('passes pagination parameters', async () => {
      fetchOnce(listOrganizationMembershipsForResourceFixture);

      await workos.authorization.listMembershipsForResource({
        resourceId: testResourceId,
        permissionSlug: 'documents:read',
        limit: 10,
        after: 'om_cursor123',
        order: 'desc',
      });

      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'documents:read',
        limit: '10',
        after: 'om_cursor123',
        order: 'desc',
      });
    });

    it('passes assignment filter when provided', async () => {
      fetchOnce(listOrganizationMembershipsForResourceFixture);

      await workos.authorization.listMembershipsForResource({
        resourceId: testResourceId,
        permissionSlug: 'documents:read',
        assignment: 'direct',
      });

      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'documents:read',
        assignment: 'direct',
      });
    });

    it('handles membership without custom_attributes', async () => {
      const fixtureWithoutCustomAttrs = {
        object: 'list',
        data: [
          {
            ...listOrganizationMembershipsForResourceFixture.data[0],
            custom_attributes: undefined,
          },
        ],
        list_metadata:
          listOrganizationMembershipsForResourceFixture.list_metadata,
      };
      fetchOnce(fixtureWithoutCustomAttrs);

      const { data } = await workos.authorization.listMembershipsForResource({
        resourceId: testResourceId,
        permissionSlug: 'documents:read',
      });

      expect(data[0].customAttributes).toEqual({});
    });

    it('handles membership without organization_name', async () => {
      const fixtureWithoutOrgName = {
        object: 'list',
        data: [
          {
            ...listOrganizationMembershipsForResourceFixture.data[0],
            organization_name: undefined,
          },
        ],
        list_metadata:
          listOrganizationMembershipsForResourceFixture.list_metadata,
      };
      fetchOnce(fixtureWithoutOrgName);

      const { data } = await workos.authorization.listMembershipsForResource({
        resourceId: testResourceId,
        permissionSlug: 'documents:read',
      });

      expect(data[0].organizationName).toBeUndefined();
    });
  });

  describe('listMembershipsForResourceByExternalId', () => {
    it('lists organization memberships for a resource by external ID', async () => {
      fetchOnce(listOrganizationMembershipsForResourceFixture);

      const { data, object, listMetadata } =
        await workos.authorization.listMembershipsForResourceByExternalId({
          organizationId: testOrgId,
          resourceTypeSlug: 'document',
          externalId: 'doc-456',
          permissionSlug: 'documents:read',
        });

      expect(fetchURL()).toContain(
        `/authorization/organizations/${testOrgId}/resources/document/doc-456/organization_memberships`,
      );
      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'documents:read',
      });
      expect(object).toEqual('list');
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        object: 'organization_membership',
        id: 'om_01HXYZ123ABC456DEF789ABC',
        userId: 'user_01HXYZ123ABC456DEF789XYZ',
        organizationId: 'org_01HXYZ123ABC456DEF789ABC',
        organizationName: 'Acme Corp',
        status: 'active',
        customAttributes: { department: 'Engineering', level: 'senior' },
      });
      expect(listMetadata).toEqual({
        before: null,
        after: 'om_01HXYZ123ABC456DEF789ABC',
      });
    });

    it('passes pagination parameters', async () => {
      fetchOnce(listOrganizationMembershipsForResourceFixture);

      await workos.authorization.listMembershipsForResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        permissionSlug: 'documents:read',
        limit: 10,
        after: 'om_cursor123',
        order: 'desc',
      });

      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'documents:read',
        limit: '10',
        after: 'om_cursor123',
        order: 'desc',
      });
    });

    it('passes before cursor for backward pagination', async () => {
      fetchOnce(listOrganizationMembershipsForResourceFixture);

      await workos.authorization.listMembershipsForResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        permissionSlug: 'documents:read',
        before: 'om_cursor789',
        order: 'asc',
      });

      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'documents:read',
        before: 'om_cursor789',
        order: 'asc',
      });
    });

    it('passes assignment filter when provided', async () => {
      fetchOnce(listOrganizationMembershipsForResourceFixture);

      await workos.authorization.listMembershipsForResourceByExternalId({
        organizationId: testOrgId,
        resourceTypeSlug: 'document',
        externalId: 'doc-456',
        permissionSlug: 'documents:read',
        assignment: 'direct',
      });

      expect(fetchSearchParams()).toMatchObject({
        permission_slug: 'documents:read',
        assignment: 'direct',
      });
    });
  });
});
