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

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

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
        expect.arrayContaining(['users:read', 'users:write', 'settings:manage']),
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
        expand: ['permissions'],
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
        ['users:read', 'users:write'],
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
        [],
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
        'billing:read',
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
});
