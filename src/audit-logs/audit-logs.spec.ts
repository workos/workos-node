import fetch from 'jest-fetch-mock';
import { UnauthorizedException } from '../common/exceptions';
import { BadRequestException } from '../common/exceptions/bad-request.exception';
import { mockWorkOsResponse } from '../common/utils/workos-mock-response';
import { WorkOS } from '../workos';
import {
  AuditLogExport,
  AuditLogExportOptions,
  AuditLogExportResponse,
  AuditLogSchema,
  CreateAuditLogEventOptions,
  CreateAuditLogSchemaOptions,
  CreateAuditLogSchemaResponse,
} from './interfaces';
import {
  serializeAuditLogExportOptions,
  serializeCreateAuditLogEventOptions,
  serializeCreateAuditLogSchemaOptions,
} from './serializers';

const event: CreateAuditLogEventOptions = {
  action: 'document.updated',
  occurredAt: new Date(),
  actor: {
    id: 'user_1',
    name: 'Jon Smith',
    type: 'user',
  },
  targets: [
    {
      id: 'document_39127',
      type: 'document',
    },
  ],
  context: {
    location: '192.0.0.8',
    userAgent: 'Firefox',
  },
  metadata: {
    successful: true,
  },
};

const schema: CreateAuditLogSchemaOptions = {
  action: 'user.logged_in',
  actor: {
    metadata: {
      actor_id: 'string',
    },
  },
  targets: [
    {
      type: 'user',
      metadata: {
        user_id: 'string',
      },
    },
  ],
  metadata: {
    foo: 'number',
    baz: 'boolean',
  },
};

const schemaWithoutMetadata = { ...schema, metadata: undefined };

describe('AuditLogs', () => {
  beforeEach(() => fetch.resetMocks());

  describe('createEvent', () => {
    describe('with an idempotency key', () => {
      it('includes an idempotency key with request', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        workosSpy.mockResolvedValueOnce(
          mockWorkOsResponse(201, { success: true }),
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createEvent('org_123', event, {
            idempotencyKey: 'the-idempotency-key',
          }),
        ).resolves.toBeUndefined();

        expect(workosSpy).toHaveBeenCalledWith(
          '/audit_logs/events',
          {
            event: serializeCreateAuditLogEventOptions(event),
            organization_id: 'org_123',
          },
          { idempotencyKey: 'the-idempotency-key' },
        );
      });
    });

    describe('without an idempotency key', () => {
      it('auto-generates an idempotency key with workos-node prefix', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        workosSpy.mockResolvedValueOnce(
          mockWorkOsResponse(201, { success: true }),
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createEvent('org_123', event),
        ).resolves.toBeUndefined();

        // Verify that an idempotency key was auto-generated
        expect(workosSpy).toHaveBeenCalledWith(
          '/audit_logs/events',
          {
            event: serializeCreateAuditLogEventOptions(event),
            organization_id: 'org_123',
          },
          expect.objectContaining({
            idempotencyKey: expect.stringMatching(/^workos-node\S*/),
          }),
        );
      });

      it('generates different idempotency keys for different requests', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        workosSpy.mockResolvedValue(mockWorkOsResponse(201, { success: true }));

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await workos.auditLogs.createEvent('org_123', event);
        await workos.auditLogs.createEvent('org_123', event);

        const firstCallKey = workosSpy.mock.calls[0][2]?.idempotencyKey;
        const secondCallKey = workosSpy.mock.calls[1][2]?.idempotencyKey;

        expect(firstCallKey).toBeDefined();
        expect(secondCallKey).toBeDefined();
        expect(firstCallKey).not.toBe(secondCallKey);
      });
    });

    describe('when the api responds with a 200', () => {
      it('returns void', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        workosSpy.mockResolvedValueOnce(
          mockWorkOsResponse(201, { success: true }),
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createEvent('org_123', event),
        ).resolves.toBeUndefined();

        expect(workosSpy).toHaveBeenCalledWith(
          '/audit_logs/events',
          {
            event: serializeCreateAuditLogEventOptions(event),
            organization_id: 'org_123',
          },
          expect.objectContaining({
            idempotencyKey: expect.stringMatching(/^workos-node\S*/),
          }),
        );
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        workosSpy.mockImplementationOnce(() => {
          throw new UnauthorizedException('a-request-id');
        });

        const workos = new WorkOS('invalid apikey');

        await expect(
          workos.auditLogs.createEvent('org_123', event),
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('when the api responds with a 400', () => {
      it('throws an BadRequestException', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        const errors = [
          {
            field: 'occurred_at',
            code: 'occurred_at must be an ISO 8601 date string',
          },
        ];

        workosSpy.mockImplementationOnce(() => {
          throw new BadRequestException({
            code: '400',
            errors,
            message:
              'Audit Log could not be processed due to missing or incorrect data.',
            requestID: 'a-request-id',
          });
        });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createEvent('org_123', event),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('retry behavior', () => {
      beforeEach(() => {
        fetch.resetMocks();
        jest.clearAllMocks();
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('retries on 500 status code and eventually succeeds', async () => {
        fetch.mockResponses(
          [JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }],
          [JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }],
          [JSON.stringify({ success: true }), { status: 201 }],
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const promise = workos.auditLogs.createEvent('org_123', event);
        await jest.runAllTimersAsync();
        await expect(promise).resolves.toBeUndefined();

        expect(fetch).toHaveBeenCalledTimes(3);
      });

      it('retries on 502 status code and eventually succeeds', async () => {
        fetch.mockResponses(
          [JSON.stringify({ error: 'Bad Gateway' }), { status: 502 }],
          [JSON.stringify({ error: 'Bad Gateway' }), { status: 502 }],
          [JSON.stringify({ success: true }), { status: 201 }],
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const promise = workos.auditLogs.createEvent('org_123', event);
        await jest.runAllTimersAsync();
        await expect(promise).resolves.toBeUndefined();

        expect(fetch).toHaveBeenCalledTimes(3);
      });

      it('retries on 504 status code and eventually succeeds', async () => {
        fetch.mockResponses(
          [JSON.stringify({ error: 'Gateway Timeout' }), { status: 504 }],
          [JSON.stringify({ error: 'Gateway Timeout' }), { status: 504 }],
          [JSON.stringify({ success: true }), { status: 201 }],
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const promise = workos.auditLogs.createEvent('org_123', event);
        await jest.runAllTimersAsync();
        await expect(promise).resolves.toBeUndefined();

        expect(fetch).toHaveBeenCalledTimes(3);
      });

      it('retries on 408 status code and eventually succeeds', async () => {
        fetch.mockResponses(
          [JSON.stringify({ error: 'Request Timeout' }), { status: 408 }],
          [JSON.stringify({ error: 'Request Timeout' }), { status: 408 }],
          [JSON.stringify({ success: true }), { status: 201 }],
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const promise = workos.auditLogs.createEvent('org_123', event);
        await jest.runAllTimersAsync();
        await expect(promise).resolves.toBeUndefined();

        expect(fetch).toHaveBeenCalledTimes(3);
      });

      it('succeeds on the last retry attempt (4th attempt)', async () => {
        fetch.mockResponses(
          [JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }],
          [JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }],
          [JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }],
          [JSON.stringify({ success: true }), { status: 201 }],
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const promise = workos.auditLogs.createEvent('org_123', event);
        await jest.runAllTimersAsync();
        await expect(promise).resolves.toBeUndefined();

        expect(fetch).toHaveBeenCalledTimes(4);
      });

      it('retries a maximum of 3 times (4 total attempts)', async () => {
        fetch.mockResponse(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
        });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const promise = workos.auditLogs
          .createEvent('org_123', event)
          .catch((e) => e);
        await jest.runAllTimersAsync();
        const result = await promise;

        expect(result).toBeInstanceOf(Error);

        // 1 initial attempt + 3 retries = 4 total attempts
        expect(fetch).toHaveBeenCalledTimes(4);
      });

      it('uses the same idempotency key across all retry attempts', async () => {
        fetch.mockResponses(
          [JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }],
          [JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }],
          [JSON.stringify({ success: true }), { status: 201 }],
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const promise = workos.auditLogs.createEvent('org_123', event, {
          idempotencyKey: 'test-idempotency-key',
        });
        await jest.runAllTimersAsync();
        await promise;

        expect(fetch).toHaveBeenCalledTimes(3);

        // Verify all requests have the same idempotency key in headers
        const calls = fetch.mock.calls;
        for (const call of calls) {
          const headers = call[1]?.headers as Record<string, string>;
          expect(headers['Idempotency-Key']).toBe('test-idempotency-key');
        }
      });

      it('maintains auto-generated idempotency key across retry attempts', async () => {
        fetch.mockResponses(
          [JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }],
          [JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }],
          [JSON.stringify({ success: true }), { status: 201 }],
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        const promise = workos.auditLogs.createEvent('org_123', event);
        await jest.runAllTimersAsync();
        await promise;

        expect(fetch).toHaveBeenCalledTimes(3);

        // Verify all requests have the same auto-generated idempotency key
        const calls = fetch.mock.calls;
        const idempotencyKeys = calls.map(
          (call) =>
            (call[1]?.headers as Record<string, string>)['Idempotency-Key'],
        );

        // All keys should be defined
        idempotencyKeys.forEach((key) => {
          expect(key).toBeDefined();
          expect(key).toMatch(/\S/);
          expect(key.startsWith('workos-node-')).toBe(true);
        });

        // All keys should be the same
        expect(idempotencyKeys[0]).toBe(idempotencyKeys[1]);
        expect(idempotencyKeys[1]).toBe(idempotencyKeys[2]);
      });
    });
  });

  describe('createExport', () => {
    describe('when the api responds with a 201', () => {
      it('returns `audit_log_export`', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        const options: AuditLogExportOptions = {
          organizationId: 'org_123',
          rangeStart: new Date(),
          rangeEnd: new Date(),
        };

        const timestamp: string = new Date().toISOString();

        const auditLogExport: AuditLogExport = {
          object: 'audit_log_export',
          id: 'audit_log_export_1234',
          state: 'pending',
          url: undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        const auditLogExportResponse: AuditLogExportResponse = {
          object: 'audit_log_export',
          id: 'audit_log_export_1234',
          state: 'pending',
          url: undefined,
          created_at: timestamp,
          updated_at: timestamp,
        };

        workosSpy.mockResolvedValueOnce(
          mockWorkOsResponse(201, auditLogExportResponse),
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.auditLogs.createExport(options)).resolves.toEqual(
          auditLogExport,
        );

        expect(workosSpy).toHaveBeenCalledWith(
          '/audit_logs/exports',
          serializeAuditLogExportOptions(options),
        );
      });
    });

    describe('when additional filters are defined', () => {
      it('returns `audit_log_export`', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        const options: AuditLogExportOptions = {
          actions: ['foo', 'bar'],
          actorNames: ['Jon', 'Smith'],
          actorIds: ['user_foo', 'user_bar'],
          organizationId: 'org_123',
          rangeEnd: new Date(),
          rangeStart: new Date(),
          targets: ['user', 'team'],
        };

        const timestamp: string = new Date().toISOString();

        const auditLogExport: AuditLogExport = {
          object: 'audit_log_export',
          id: 'audit_log_export_1234',
          state: 'pending',
          url: undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        const auditLogExportResponse: AuditLogExportResponse = {
          object: 'audit_log_export',
          id: 'audit_log_export_1234',
          state: 'pending',
          url: undefined,
          created_at: timestamp,
          updated_at: timestamp,
        };

        workosSpy.mockResolvedValueOnce(
          mockWorkOsResponse(201, auditLogExportResponse),
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.auditLogs.createExport(options)).resolves.toEqual(
          auditLogExport,
        );

        expect(workosSpy).toHaveBeenCalledWith(
          '/audit_logs/exports',
          serializeAuditLogExportOptions(options),
        );
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        const options: AuditLogExportOptions = {
          organizationId: 'org_123',
          rangeStart: new Date(),
          rangeEnd: new Date(),
        };

        workosSpy.mockImplementationOnce(() => {
          throw new UnauthorizedException('a-request-id');
        });

        const workos = new WorkOS('invalid apikey');

        await expect(workos.auditLogs.createExport(options)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });
  });

  describe('getExport', () => {
    describe('when the api responds with a 201', () => {
      it('returns `audit_log_export`', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'get');

        const timestamp: string = new Date().toISOString();

        const auditLogExport: AuditLogExport = {
          object: 'audit_log_export',
          id: 'audit_log_export_1234',
          state: 'pending',
          url: undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        const auditLogExportResponse: AuditLogExportResponse = {
          object: 'audit_log_export',
          id: 'audit_log_export_1234',
          state: 'pending',
          url: undefined,
          created_at: timestamp,
          updated_at: timestamp,
        };

        workosSpy.mockResolvedValueOnce(
          mockWorkOsResponse(201, auditLogExportResponse),
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.getExport(auditLogExport.id),
        ).resolves.toEqual(auditLogExport);

        expect(workosSpy).toHaveBeenCalledWith(
          `/audit_logs/exports/${auditLogExport.id}`,
        );
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'get');

        workosSpy.mockImplementationOnce(() => {
          throw new UnauthorizedException('a-request-id');
        });

        const workos = new WorkOS('invalid apikey');

        await expect(
          workos.auditLogs.getExport('audit_log_export_1234'),
        ).rejects.toThrow(UnauthorizedException);

        expect(workosSpy).toHaveBeenCalledWith(
          `/audit_logs/exports/audit_log_export_1234`,
        );
      });
    });
  });

  describe('createSchema', () => {
    describe('with an idempotency key', () => {
      it('includes an idempotency key with request', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        const time = new Date().toISOString();

        const createSchemaResult: AuditLogSchema = {
          object: 'audit_log_schema',
          version: 1,
          targets: [
            {
              type: 'user',
              metadata: {
                user_id: 'string',
              },
            },
          ],
          actor: {
            metadata: {
              actor_id: 'string',
            },
          },
          metadata: {
            foo: 'number',
            baz: 'boolean',
          },
          createdAt: time,
        };

        const createSchemaResponse: CreateAuditLogSchemaResponse = {
          object: 'audit_log_schema',
          version: 1,
          targets: [
            {
              type: 'user',
              metadata: {
                type: 'object',
                properties: {
                  user_id: {
                    type: 'string',
                  },
                },
              },
            },
          ],
          actor: {
            metadata: {
              type: 'object',
              properties: {
                actor_id: {
                  type: 'string',
                },
              },
            },
          },
          metadata: {
            type: 'object',
            properties: {
              foo: {
                type: 'number',
              },
              baz: {
                type: 'boolean',
              },
            },
          },
          created_at: time,
        };

        workosSpy.mockResolvedValueOnce(
          mockWorkOsResponse(201, createSchemaResponse),
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createSchema(schema, {
            idempotencyKey: 'the-idempotency-key',
          }),
        ).resolves.toEqual(createSchemaResult);

        expect(workosSpy).toHaveBeenCalledWith(
          '/audit_logs/actions/user.logged_in/schemas',
          serializeCreateAuditLogSchemaOptions(schema),
          { idempotencyKey: 'the-idempotency-key' },
        );
      });
    });

    describe('without metadata', () => {
      it('does not include metadata with the request', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        const time = new Date().toISOString();

        const createSchemaResult: AuditLogSchema = {
          object: 'audit_log_schema',
          version: 1,
          targets: [
            {
              type: 'user',
              metadata: {
                user_id: 'string',
              },
            },
          ],
          actor: {
            metadata: {
              actor_id: 'string',
            },
          },
          metadata: undefined,
          createdAt: time,
        };

        const createSchemaResponse: CreateAuditLogSchemaResponse = {
          object: 'audit_log_schema',
          version: 1,
          targets: [
            {
              type: 'user',
              metadata: {
                type: 'object',
                properties: {
                  user_id: {
                    type: 'string',
                  },
                },
              },
            },
          ],
          actor: {
            metadata: {
              type: 'object',
              properties: {
                actor_id: {
                  type: 'string',
                },
              },
            },
          },
          created_at: time,
        };

        workosSpy.mockResolvedValueOnce(
          mockWorkOsResponse(201, createSchemaResponse),
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createSchema(schemaWithoutMetadata),
        ).resolves.toEqual(createSchemaResult);

        expect(workosSpy).toHaveBeenCalledWith(
          '/audit_logs/actions/user.logged_in/schemas',
          serializeCreateAuditLogSchemaOptions(schemaWithoutMetadata),
          {},
        );
      });
    });

    describe('when the api responds with a 201', () => {
      it('returns `audit_log_schema`', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        const time = new Date().toISOString();

        const createSchemaResult: AuditLogSchema = {
          object: 'audit_log_schema',
          version: 1,
          targets: [
            {
              type: 'user',
              metadata: {
                user_id: 'string',
              },
            },
          ],
          actor: {
            metadata: {
              actor_id: 'string',
            },
          },
          metadata: {
            foo: 'number',
            baz: 'boolean',
          },
          createdAt: time,
        };

        const createSchemaResponse: CreateAuditLogSchemaResponse = {
          object: 'audit_log_schema',
          version: 1,
          targets: [
            {
              type: 'user',
              metadata: {
                type: 'object',
                properties: {
                  user_id: {
                    type: 'string',
                  },
                },
              },
            },
          ],
          actor: {
            metadata: {
              type: 'object',
              properties: {
                actor_id: {
                  type: 'string',
                },
              },
            },
          },
          metadata: {
            type: 'object',
            properties: {
              foo: {
                type: 'number',
              },
              baz: {
                type: 'boolean',
              },
            },
          },
          created_at: time,
        };

        workosSpy.mockResolvedValueOnce(
          mockWorkOsResponse(201, createSchemaResponse),
        );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createSchema(schema, {
            idempotencyKey: 'the-idempotency-key',
          }),
        ).resolves.toEqual(createSchemaResult);
      });
    });

    describe('when the api responds with a 400', () => {
      it('throws a BadRequestException', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        const errors = [
          {
            field: 'actor.metadata',
            code: 'actor.metadata must be an object',
          },
        ];

        workosSpy.mockImplementationOnce(() => {
          throw new BadRequestException({
            code: '400',
            errors,
            message:
              'Audit Log Schema could not be processed due to missing or incorrect data.',
            requestID: 'a-request-id',
          });
        });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.auditLogs.createSchema(schema)).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });
});
