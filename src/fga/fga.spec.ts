import fetch from 'jest-fetch-mock';
import {
  fetchBody,
  fetchHeaders,
  fetchOnce,
  fetchSearchParams,
  fetchURL,
} from '../common/utils/test-utils';

import { WorkOS } from '../workos';
import { ResourceOp, WarrantOp } from './interfaces';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('FGA', () => {
  beforeEach(() => fetch.resetMocks());

  describe('check', () => {
    it('makes check request', async () => {
      fetchOnce({
        result: 'authorized',
        is_implicit: false,
        warrant_token: 'abc',
      });
      const checkResult = await workos.fga.check({
        checks: [
          {
            resource: {
              resourceType: 'role',
              resourceId: 'admin',
            },
            relation: 'member',
            subject: {
              resourceType: 'user',
              resourceId: 'user_123',
            },
          },
        ],
      });
      expect(fetchURL()).toContain('/fga/v1/check');
      expect(checkResult).toMatchObject({
        result: 'authorized',
        isImplicit: false,
        warrantToken: 'abc',
      });
    });

    it('deserializes warnings in check response', async () => {
      fetchOnce({
        result: 'authorized',
        is_implicit: false,
        warrant_token: 'abc',
        warnings: [
          {
            code: 'missing_context_keys',
            message: 'Missing required context keys',
            keys: ['tenant_id', 'region'],
          },
          {
            code: 'some_other_warning',
            message: 'Some other warning message',
          },
        ],
      });
      const checkResult = await workos.fga.check({
        checks: [
          {
            resource: {
              resourceType: 'role',
              resourceId: 'admin',
            },
            relation: 'member',
            subject: {
              resourceType: 'user',
              resourceId: 'user_123',
            },
          },
        ],
      });
      expect(fetchURL()).toContain('/fga/v1/check');
      expect(checkResult).toMatchObject({
        result: 'authorized',
        isImplicit: false,
        warrantToken: 'abc',
        warnings: [
          {
            code: 'missing_context_keys',
            message: 'Missing required context keys',
            keys: ['tenant_id', 'region'],
          },
          {
            code: 'some_other_warning',
            message: 'Some other warning message',
          },
        ],
      });
    });
  });

  describe('createResource', () => {
    it('creates resource', async () => {
      fetchOnce({
        resource_type: 'role',
        resource_id: 'admin',
      });
      const resource = await workos.fga.createResource({
        resource: {
          resourceType: 'role',
          resourceId: 'admin',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/resources');
      expect(resource).toMatchObject({
        resourceType: 'role',
        resourceId: 'admin',
      });
    });

    it('creates resource with metadata', async () => {
      fetchOnce({
        resource_type: 'role',
        resource_id: 'admin',
        meta: {
          description: 'The admin role',
        },
      });
      const resource = await workos.fga.createResource({
        resource: {
          resourceType: 'role',
          resourceId: 'admin',
        },
        meta: {
          description: 'The admin role',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/resources');
      expect(resource).toMatchObject({
        resourceType: 'role',
        resourceId: 'admin',
        meta: {
          description: 'The admin role',
        },
      });
    });
  });

  describe('getResource', () => {
    it('gets resource', async () => {
      fetchOnce({
        resource_type: 'role',
        resource_id: 'admin',
      });
      const resource = await workos.fga.getResource({
        resourceType: 'role',
        resourceId: 'admin',
      });
      expect(fetchURL()).toContain('/fga/v1/resources/role/admin');
      expect(resource).toMatchObject({
        resourceType: 'role',
        resourceId: 'admin',
      });
    });
  });

  describe('listResources', () => {
    it('lists resources', async () => {
      fetchOnce({
        data: [
          {
            resource_type: 'role',
            resource_id: 'admin',
          },
          {
            resource_type: 'role',
            resource_id: 'manager',
          },
        ],
        list_metadata: {
          before: null,
          after: null,
        },
      });
      const { data: resources } = await workos.fga.listResources();
      expect(fetchURL()).toContain('/fga/v1/resources');
      expect(resources).toMatchObject([
        {
          resourceType: 'role',
          resourceId: 'admin',
        },
        {
          resourceType: 'role',
          resourceId: 'manager',
        },
      ]);
    });

    it('sends correct params when filtering', async () => {
      fetchOnce({
        data: [
          {
            resource_type: 'role',
            resource_id: 'admin',
          },
          {
            resource_type: 'role',
            resource_id: 'manager',
          },
        ],
        list_metadata: {
          before: null,
          after: null,
        },
      });
      await workos.fga.listResources({
        resourceType: 'role',
      });
      expect(fetchURL()).toContain('/fga/v1/resources');
      expect(fetchSearchParams()).toEqual({
        resource_type: 'role',
        order: 'desc',
      });
    });
  });

  describe('deleteResource', () => {
    it('should delete resource', async () => {
      fetchOnce();
      const response = await workos.fga.deleteResource({
        resourceType: 'role',
        resourceId: 'admin',
      });
      expect(fetchURL()).toContain('/fga/v1/resources/role/admin');
      expect(response).toBeUndefined();
    });
  });

  describe('batchWriteResources', () => {
    it('batch create resources', async () => {
      fetchOnce({
        data: [
          {
            resource_type: 'role',
            resource_id: 'admin',
            meta: {
              description: 'The admin role',
            },
          },
          {
            resource_type: 'role',
            resource_id: 'manager',
          },
          {
            resource_type: 'role',
            resource_id: 'employee',
          },
        ],
      });
      const createdResources = await workos.fga.batchWriteResources({
        op: ResourceOp.Create,
        resources: [
          {
            resource: {
              resourceType: 'role',
              resourceId: 'admin',
            },
            meta: {
              description: 'The admin role',
            },
          },
          {
            resource: {
              resourceType: 'role',
              resourceId: 'manager',
            },
          },
          {
            resource: {
              resourceType: 'role',
              resourceId: 'employee',
            },
          },
        ],
      });
      expect(fetchURL()).toContain('/fga/v1/resources/batch');
      expect(createdResources).toMatchObject([
        {
          resourceType: 'role',
          resourceId: 'admin',
          meta: {
            description: 'The admin role',
          },
        },
        {
          resourceType: 'role',
          resourceId: 'manager',
        },
        {
          resourceType: 'role',
          resourceId: 'employee',
        },
      ]);
    });

    it('batch delete resources', async () => {
      fetchOnce({
        data: [
          {
            resource_type: 'role',
            resource_id: 'admin',
          },
          {
            resource_type: 'role',
            resource_id: 'manager',
          },
          {
            resource_type: 'role',
            resource_id: 'employee',
          },
        ],
      });
      const deletedResources = await workos.fga.batchWriteResources({
        op: ResourceOp.Delete,
        resources: [
          {
            resource: {
              resourceType: 'role',
              resourceId: 'admin',
            },
            meta: {
              description: 'The admin role',
            },
          },
          {
            resource: {
              resourceType: 'role',
              resourceId: 'manager',
            },
          },
          {
            resource: {
              resourceType: 'role',
              resourceId: 'employee',
            },
          },
        ],
      });
      expect(fetchURL()).toContain('/fga/v1/resources/batch');
      expect(deletedResources).toMatchObject([
        {
          resourceType: 'role',
          resourceId: 'admin',
        },
        {
          resourceType: 'role',
          resourceId: 'manager',
        },
        {
          resourceType: 'role',
          resourceId: 'employee',
        },
      ]);
    });
  });

  describe('writeWarrant', () => {
    it('should create warrant with no op', async () => {
      fetchOnce({
        warrant_token: 'some_token',
      });
      const warrantToken = await workos.fga.writeWarrant({
        resource: {
          resourceType: 'role',
          resourceId: 'admin',
        },
        relation: 'member',
        subject: {
          resourceType: 'user',
          resourceId: 'user_123',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(fetchBody()).toEqual({
        resource_type: 'role',
        resource_id: 'admin',
        relation: 'member',
        subject: {
          resource_type: 'user',
          resource_id: 'user_123',
        },
      });
      expect(warrantToken).toMatchObject({
        warrantToken: 'some_token',
      });
    });

    it('should create warrant with create op', async () => {
      fetchOnce({
        warrant_token: 'some_token',
      });
      const warrantToken = await workos.fga.writeWarrant({
        op: WarrantOp.Create,
        resource: {
          resourceType: 'role',
          resourceId: 'admin',
        },
        relation: 'member',
        subject: {
          resourceType: 'user',
          resourceId: 'user_123',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(fetchBody()).toEqual({
        op: 'create',
        resource_type: 'role',
        resource_id: 'admin',
        relation: 'member',
        subject: {
          resource_type: 'user',
          resource_id: 'user_123',
        },
      });
      expect(warrantToken).toMatchObject({
        warrantToken: 'some_token',
      });
    });

    it('should delete warrant with delete op', async () => {
      fetchOnce({
        warrant_token: 'some_token',
      });
      const warrantToken = await workos.fga.writeWarrant({
        op: WarrantOp.Delete,
        resource: {
          resourceType: 'role',
          resourceId: 'admin',
        },
        relation: 'member',
        subject: {
          resourceType: 'user',
          resourceId: 'user_123',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(fetchBody()).toEqual({
        op: 'delete',
        resource_type: 'role',
        resource_id: 'admin',
        relation: 'member',
        subject: {
          resource_type: 'user',
          resource_id: 'user_123',
        },
      });
      expect(warrantToken).toMatchObject({
        warrantToken: 'some_token',
      });
    });
  });

  describe('batchWriteWarrants', () => {
    it('should create warrants with no op or create op and delete warrants with delete op', async () => {
      fetchOnce({
        warrant_token: 'some_token',
      });
      const warrantToken = await workos.fga.batchWriteWarrants([
        {
          resource: {
            resourceType: 'role',
            resourceId: 'admin',
          },
          relation: 'member',
          subject: {
            resourceType: 'user',
            resourceId: 'user_123',
          },
        },
        {
          op: WarrantOp.Create,
          resource: {
            resourceType: 'role',
            resourceId: 'admin',
          },
          relation: 'member',
          subject: {
            resourceType: 'user',
            resourceId: 'user_124',
          },
        },
        {
          op: WarrantOp.Delete,
          resource: {
            resourceType: 'role',
            resourceId: 'admin',
          },
          relation: 'member',
          subject: {
            resourceType: 'user',
            resourceId: 'user_125',
          },
        },
      ]);
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(fetchBody()).toEqual([
        {
          resource_type: 'role',
          resource_id: 'admin',
          relation: 'member',
          subject: {
            resource_type: 'user',
            resource_id: 'user_123',
          },
        },
        {
          op: 'create',
          resource_type: 'role',
          resource_id: 'admin',
          relation: 'member',
          subject: {
            resource_type: 'user',
            resource_id: 'user_124',
          },
        },
        {
          op: 'delete',
          resource_type: 'role',
          resource_id: 'admin',
          relation: 'member',
          subject: {
            resource_type: 'user',
            resource_id: 'user_125',
          },
        },
      ]);
      expect(warrantToken).toMatchObject({
        warrantToken: 'some_token',
      });
    });
  });

  describe('listWarrants', () => {
    it('should list warrants', async () => {
      fetchOnce({
        data: [
          {
            resource_type: 'role',
            resource_id: 'admin',
            relation: 'member',
            subject: {
              resource_type: 'user',
              resource_id: 'user_123',
            },
          },
          {
            resource_type: 'role',
            resource_id: 'admin',
            relation: 'member',
            subject: {
              resource_type: 'user',
              resource_id: 'user_124',
            },
            policy: 'region == "us"',
          },
        ],
        list_metadata: {
          before: null,
          after: null,
        },
      });
      const { data: warrants } = await workos.fga.listWarrants();
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(warrants).toMatchObject([
        {
          resourceType: 'role',
          resourceId: 'admin',
          relation: 'member',
          subject: {
            resourceType: 'user',
            resourceId: 'user_123',
          },
        },
        {
          resourceType: 'role',
          resourceId: 'admin',
          relation: 'member',
          subject: {
            resourceType: 'user',
            resourceId: 'user_124',
          },
          policy: 'region == "us"',
        },
      ]);
    });

    it('sends correct params when filtering', async () => {
      fetchOnce({
        data: [
          {
            resource_type: 'role',
            resource_id: 'admin',
            relation: 'member',
            subject: {
              resource_type: 'user',
              resource_id: 'user_123',
            },
          },
        ],
        list_metadata: {
          before: null,
          after: null,
        },
      });
      await workos.fga.listWarrants({
        subjectType: 'user',
        subjectId: 'user_123',
      });
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(fetchSearchParams()).toEqual({
        subject_type: 'user',
        subject_id: 'user_123',
        order: 'desc',
      });
    });
  });

  describe('query', () => {
    it('makes query request', async () => {
      fetchOnce({
        data: [
          {
            resource_type: 'role',
            resource_id: 'admin',
            warrant: {
              resource_type: 'role',
              resource_id: 'admin',
              relation: 'member',
              subject: {
                resource_type: 'user',
                resource_id: 'user_123',
              },
            },
            is_implicit: false,
          },
        ],
        list_metadata: {
          before: null,
          after: null,
        },
      });
      const { data: queryResults } = await workos.fga.query({
        q: 'select role where user:user_123 is member',
      });
      expect(fetchURL()).toContain('/fga/v1/query');
      expect(queryResults).toMatchObject([
        {
          resourceType: 'role',
          resourceId: 'admin',
          warrant: {
            resourceType: 'role',
            resourceId: 'admin',
            relation: 'member',
            subject: {
              resourceType: 'user',
              resourceId: 'user_123',
            },
          },
          isImplicit: false,
        },
      ]);
    });

    it('deserializes warnings in query response', async () => {
      fetchOnce({
        data: [
          {
            resource_type: 'role',
            resource_id: 'admin',
            warrant: {
              resource_type: 'role',
              resource_id: 'admin',
              relation: 'member',
              subject: {
                resource_type: 'user',
                resource_id: 'user_123',
              },
            },
            is_implicit: false,
          },
          {
            resource_type: 'role',
            resource_id: 'manager',
            warrant: {
              resource_type: 'role',
              resource_id: 'manager',
              relation: 'member',
              subject: {
                resource_type: 'user',
                resource_id: 'user_123',
              },
            },
            is_implicit: true,
          },
        ],
        list_metadata: {
          before: null,
          after: null,
        },
        warnings: [
          {
            code: 'missing_context_keys',
            message: 'Missing required context keys',
            keys: ['tenant_id'],
          },
          {
            code: 'some_other_warning',
            message: 'Some other warning message',
          },
        ],
      });
      const result = await workos.fga.query({
        q: 'select role where user:user_123 is member',
      });
      expect(fetchURL()).toContain('/fga/v1/query');
      expect(result.data).toMatchObject([
        {
          resourceType: 'role',
          resourceId: 'admin',
          warrant: {
            resourceType: 'role',
            resourceId: 'admin',
            relation: 'member',
            subject: {
              resourceType: 'user',
              resourceId: 'user_123',
            },
          },
          isImplicit: false,
        },
        {
          resourceType: 'role',
          resourceId: 'manager',
          warrant: {
            resourceType: 'role',
            resourceId: 'manager',
            relation: 'member',
            subject: {
              resourceType: 'user',
              resourceId: 'user_123',
            },
          },
          isImplicit: true,
        },
      ]);
      expect(result.warnings).toMatchObject([
        {
          code: 'missing_context_keys',
          message: 'Missing required context keys',
          keys: ['tenant_id'],
        },
        {
          code: 'some_other_warning',
          message: 'Some other warning message',
        },
      ]);
    });

    it('sends correct params and options', async () => {
      fetchOnce({
        data: [
          {
            resourceType: 'role',
            resourceId: 'admin',
            warrant: {
              resourceType: 'role',
              resourceId: 'admin',
              relation: 'member',
              subject: {
                resourceType: 'user',
                resourceId: 'user_123',
              },
            },
            isImplicit: false,
          },
        ],
        list_metadata: {
          before: null,
          after: null,
        },
      });
      await workos.fga.query(
        {
          q: 'select role where user:user_123 is member',
          order: 'asc',
        },
        {
          warrantToken: 'some_token',
        },
      );
      expect(fetchURL()).toContain('/fga/v1/query');
      expect(fetchSearchParams()).toEqual({
        q: 'select role where user:user_123 is member',
        order: 'asc',
      });
      expect(fetchHeaders()).toMatchObject({
        'Warrant-Token': 'some_token',
      });
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

        const resource = await workos.fga.authorization.getResource(
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

        const resource = await workos.fga.authorization.getResource(
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

        const resource = await workos.fga.authorization.createResource({
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

        const resource = await workos.fga.authorization.createResource({
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

        const resource = await workos.fga.authorization.updateResource({
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

        const resource = await workos.fga.authorization.updateResource({
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

        const resource = await workos.fga.authorization.updateResource({
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

        const resource = await workos.fga.authorization.updateResource({
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

        await workos.fga.authorization.deleteResource(
          'authz_resource_01HXYZ123ABC456DEF789GHI',
        );

        expect(fetchURL()).toContain(
          '/authorization/resources/authz_resource_01HXYZ123ABC456DEF789GHI',
        );
      });
    });
  });
});
