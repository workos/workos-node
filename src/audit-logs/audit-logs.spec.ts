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
import { FetchError } from '../common/utils/fetch-error';

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
          {},
        );
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        const workosSpy = jest.spyOn(WorkOS.prototype, 'post');

        workosSpy.mockImplementationOnce(() => {
          throw new FetchError({
            message:
              'Could not authorize the request. Maybe your API key is invalid?',
            response: { status: 401, headers: new Headers(), data: {} },
          });
        });

        const workos = new WorkOS('invalid apikey');

        await expect(
          workos.auditLogs.createEvent('org_123', event),
        ).rejects.toThrowError(new UnauthorizedException('a-request-id'));
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
          actors: ['Jon', 'Smith'],
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
          throw new FetchError({
            message:
              'Could not authorize the request. Maybe your API key is invalid?',
            response: { status: 401, headers: new Headers(), data: {} },
          });
        });

        const workos = new WorkOS('invalid apikey');

        await expect(
          workos.auditLogs.createExport(options),
        ).rejects.toThrowError(new UnauthorizedException('a-request-id'));
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
          throw new FetchError({
            message:
              'Could not authorize the request. Maybe your API key is invalid?',
            response: { status: 401, headers: new Headers(), data: {} },
          });
        });

        const workos = new WorkOS('invalid apikey');

        await expect(
          workos.auditLogs.getExport('audit_log_export_1234'),
        ).rejects.toThrowError(new UnauthorizedException('a-request-id'));

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
