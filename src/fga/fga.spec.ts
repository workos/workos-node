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
        isImplicit: false,
      });
      const checkResult = await workos.fga.check({
        object: {
          objectType: 'role',
          objectId: 'admin',
        },
        relation: 'member',
        subject: {
          objectType: 'user',
          objectId: 'user_123',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/check');
      expect(checkResult).toEqual(true);
    });
  });

  describe('createObject', () => {
    it('creates object', async () => {
      fetchOnce({
        objectType: 'role',
        objectId: 'admin',
      });
      const object = await workos.fga.createObject({
        object: {
          objectType: 'role',
          objectId: 'admin',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/objects');
      expect(object).toMatchObject({
        objectType: 'role',
        objectId: 'admin',
      });
    });

    it('creates object with metadata', async () => {
      fetchOnce({
        objectType: 'role',
        objectId: 'admin',
        meta: {
          description: 'The admin role',
        },
      });
      const object = await workos.fga.createObject({
        object: {
          objectType: 'role',
          objectId: 'admin',
        },
        meta: {
          description: 'The admin role',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/objects');
      expect(object).toMatchObject({
        objectType: 'role',
        objectId: 'admin',
        meta: {
          description: 'The admin role',
        },
      });
    });
  });

  describe('getObject', () => {
    it('gets object', async () => {
      fetchOnce({
        objectType: 'role',
        objectId: 'admin',
      });
      const object = await workos.fga.getObject({
        objectType: 'role',
        objectId: 'admin',
      });
      expect(fetchURL()).toContain('/fga/v1/objects/role/admin');
      expect(object).toMatchObject({
        objectType: 'role',
        objectId: 'admin',
      });
    });
  });

  describe('listObjects', () => {
    it('lists objects', async () => {
      fetchOnce([
        {
          objectType: 'role',
          objectId: 'admin',
        },
        {
          objectType: 'role',
          objectId: 'manager',
        },
      ]);
      const objects = await workos.fga.listObjects();
      expect(fetchURL()).toContain('/fga/v1/objects');
      expect(objects).toMatchObject([
        {
          objectType: 'role',
          objectId: 'admin',
        },
        {
          objectType: 'role',
          objectId: 'manager',
        },
      ]);
    });

    it('sends correct params when filtering', async () => {
      fetchOnce([
        {
          objectType: 'role',
          objectId: 'admin',
        },
        {
          objectType: 'role',
          objectId: 'manager',
        },
      ]);
      await workos.fga.listObjects({
        objectType: 'role',
      });
      expect(fetchURL()).toContain('/fga/v1/objects');
      expect(fetchSearchParams()).toEqual({
        objectType: 'role',
      });
    });
  });

  describe('deleteObject', () => {
    it('should delete object', async () => {
      fetchOnce();
      const response = await workos.fga.deleteObject({
        objectType: 'role',
        objectId: 'admin',
      });
      expect(fetchURL()).toContain('/fga/v1/objects/role/admin');
      expect(response).toBeUndefined();
    });
  });

  describe('writeWarrant', () => {
    it('should create warrant with no op', async () => {
      fetchOnce({
        warrantToken: 'some_token',
      });
      const warrantToken = await workos.fga.writeWarrant({
        object: {
          objectType: 'role',
          objectId: 'admin',
        },
        relation: 'member',
        subject: {
          objectType: 'user',
          objectId: 'user_123',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(fetchBody()).toEqual({
        op: 'create',
        objectType: 'role',
        objectId: 'admin',
        relation: 'member',
        subject: {
          objectType: 'user',
          objectId: 'user_123',
        },
      });
      expect(warrantToken).toMatchObject({
        warrantToken: 'some_token',
      });
    });

    it('should create warrant with create op', async () => {
      fetchOnce({
        warrantToken: 'some_token',
      });
      const warrantToken = await workos.fga.writeWarrant({
        op: WarrantOp.Create,
        object: {
          objectType: 'role',
          objectId: 'admin',
        },
        relation: 'member',
        subject: {
          objectType: 'user',
          objectId: 'user_123',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(fetchBody()).toEqual({
        op: 'create',
        objectType: 'role',
        objectId: 'admin',
        relation: 'member',
        subject: {
          objectType: 'user',
          objectId: 'user_123',
        },
      });
      expect(warrantToken).toMatchObject({
        warrantToken: 'some_token',
      });
    });

    it('should delete warrant with delete op', async () => {
      fetchOnce({
        warrantToken: 'some_token',
      });
      const warrantToken = await workos.fga.writeWarrant({
        op: WarrantOp.Delete,
        object: {
          objectType: 'role',
          objectId: 'admin',
        },
        relation: 'member',
        subject: {
          objectType: 'user',
          objectId: 'user_123',
        },
      });
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(fetchBody()).toEqual({
        op: 'delete',
        objectType: 'role',
        objectId: 'admin',
        relation: 'member',
        subject: {
          objectType: 'user',
          objectId: 'user_123',
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
        warrantToken: 'some_token',
      });
      const warrantToken = await workos.fga.batchWriteWarrants([
        {
          object: {
            objectType: 'role',
            objectId: 'admin',
          },
          relation: 'member',
          subject: {
            objectType: 'user',
            objectId: 'user_123',
          },
        },
        {
          op: WarrantOp.Create,
          object: {
            objectType: 'role',
            objectId: 'admin',
          },
          relation: 'member',
          subject: {
            objectType: 'user',
            objectId: 'user_124',
          },
        },
        {
          op: WarrantOp.Delete,
          object: {
            objectType: 'role',
            objectId: 'admin',
          },
          relation: 'member',
          subject: {
            objectType: 'user',
            objectId: 'user_125',
          },
        },
      ]);
      expect(fetchURL()).toContain('/fga/v1/warrants');
      expect(fetchBody()).toEqual([
        {
          op: 'create',
          object_type: 'role',
          object_id: 'admin',
          relation: 'member',
          subject: {
            object_type: 'user',
            object_id: 'user_123',
          },
        },
        {
          op: 'create',
          object_type: 'role',
          object_id: 'admin',
          relation: 'member',
          subject: {
            object_type: 'user',
            object_id: 'user_124',
          },
        },
        {
          op: 'delete',
          object_type: 'role',
          object_id: 'admin',
          relation: 'member',
          subject: {
            object_type: 'user',
            object_id: 'user_125',
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
            objectType: 'role',
            objectId: 'admin',
            relation: 'member',
            subject: {
              objectType: 'user',
              objectId: 'user_123',
            },
          },
          {
            objectType: 'role',
            objectId: 'admin',
            relation: 'member',
            subject: {
              objectType: 'user',
              objectId: 'user_124',
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
          objectType: 'role',
          objectId: 'admin',
          relation: 'member',
          subject: {
            objectType: 'user',
            objectId: 'user_123',
          },
        },
        {
          objectType: 'role',
          objectId: 'admin',
          relation: 'member',
          subject: {
            objectType: 'user',
            objectId: 'user_124',
          },
        },
      ]);
    });

    it('sends correct params when filtering', async () => {
      fetchOnce({
        data: [
          {
            objectType: 'role',
            objectId: 'admin',
            relation: 'member',
            subject: {
              objectType: 'user',
              objectId: 'user_123',
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
        subjectType: 'user',
        subjectId: 'user_123',
      });
    });
  });

  describe('query', () => {
    it('makes query request', async () => {
      fetchOnce({
        data: [
          {
            objectType: 'role',
            objectId: 'admin',
            warrant: {
              objectType: 'role',
              objectId: 'admin',
              relation: 'member',
              subject: {
                objectType: 'user',
                objectId: 'user_123',
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
      const queryResult = await workos.fga.query({
        q: 'select role where user:user_123 is member',
      });
      expect(fetchURL()).toContain('/fga/v1/query');
      expect(queryResult).toMatchObject([
        {
          objectType: 'role',
          objectId: 'admin',
          warrant: {
            objectType: 'role',
            objectId: 'admin',
            relation: 'member',
            subject: {
              objectType: 'user',
              objectId: 'user_123',
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
            objectType: 'role',
            objectId: 'admin',
            warrant: {
              objectType: 'role',
              objectId: 'admin',
              relation: 'member',
              subject: {
                objectType: 'user',
                objectId: 'user_123',
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
