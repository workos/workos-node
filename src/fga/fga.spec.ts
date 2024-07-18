import fetch from 'jest-fetch-mock';
import {
  fetchBody,
  fetchHeaders,
  fetchOnce,
  fetchSearchParams,
  fetchURL,
} from '../common/utils/test-utils';

import { WorkOS } from '../workos';
import { WarrantOp } from './interfaces';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('FGA', () => {
  beforeEach(() => fetch.resetMocks());

  describe('check', () => {
    it('makes check request', async () => {
      fetchOnce({
        code: 200,
        result: 'Authorized',
        is_implicit: false,
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
        code: 200,
        result: 'Authorized',
        isImplicit: false,
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
});
