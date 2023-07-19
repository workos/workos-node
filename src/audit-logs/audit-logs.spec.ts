import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import { UnauthorizedException } from '../common/exceptions';
import { BadRequestException } from '../common/exceptions/bad-request.exception';
import { WorkOS } from '../workos';
import { CreateAuditLogEventOptions } from './interfaces';
import { AuditLogExportOptions } from './interfaces/audit-log-export-options.interface';
import { AuditLogExport } from './interfaces/audit-log-export.interface';

const mock = new MockAdapater(axios);
const event: CreateAuditLogEventOptions = {
  action: 'document.updated',
  occurred_at: new Date(),
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
    location: ' 192.0.0.8',
    user_agent: 'Firefox',
  },
  metadata: {
    successful: true,
  },
};

const serializeEventOptions = (options: CreateAuditLogEventOptions) => ({
  ...options,
  occurred_at: options.occurred_at.toISOString(),
});

describe('AuditLogs', () => {
  describe('createEvent', () => {
    describe('with an idempotency key', () => {
      it('includes an idempotency key with request', async () => {
        mock
          .onPost('/audit_logs/events', {
            event: serializeEventOptions(event),
            organization_id: 'org_123',
          })
          .replyOnce(201, { success: true });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createEvent('org_123', event, {
            idempotencyKey: 'the-idempotency-key',
          }),
        ).resolves.toBeUndefined();

        expect(mock.history.post[0].headers?.['Idempotency-Key']).toEqual(
          'the-idempotency-key',
        );
      });
    });

    describe('when the api responds with a 200', () => {
      it('returns void', async () => {
        mock
          .onPost('/audit_logs/events', {
            organization_id: 'org_123',
            event: serializeEventOptions(event),
          })
          .replyOnce(201, { success: true });

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createEvent('org_123', event),
        ).resolves.toBeUndefined();
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        mock
          .onPost('/audit_logs/events', {
            organization_id: 'org_123',
            event: serializeEventOptions(event),
          })
          .replyOnce(
            401,
            {
              message: 'Unauthorized',
            },
            { 'X-Request-ID': 'a-request-id' },
          );

        const workos = new WorkOS('invalid apikey');

        await expect(
          workos.auditLogs.createEvent('org_123', event),
        ).rejects.toStrictEqual(new UnauthorizedException('a-request-id'));
      });
    });

    describe('when the api responds with a 400', () => {
      it('throws an BadRequestException', async () => {
        const errors = [
          {
            field: 'occurred_at',
            code: 'occurred_at must be an ISO 8601 date string',
          },
        ];

        mock
          .onPost('/audit_logs/events', {
            organization_id: 'org_123',
            event: serializeEventOptions(event),
          })
          .replyOnce(
            400,
            {
              message:
                'Audit Log could not be processed due to missing or incorrect data.',
              code: 'invalid_audit_log',
              errors,
            },
            { 'X-Request-ID': 'a-request-id' },
          );

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.createEvent('org_123', event),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('createExport', () => {
    const serializeExportOptions = ({
      range_end,
      range_start,
      ...options
    }: AuditLogExportOptions) => ({
      range_start: range_start.toISOString(),
      range_end: range_end.toISOString(),
      ...options,
    });

    describe('when the api responds with a 201', () => {
      it('returns `audit_log_export`', async () => {
        const options: AuditLogExportOptions = {
          organization_id: 'org_123',
          range_start: new Date(),
          range_end: new Date(),
        };

        const auditLogExport: AuditLogExport = {
          object: 'audit_log_export',
          id: 'audit_log_export_1234',
          state: 'pending',
          url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mock
          .onPost('/audit_logs/exports', serializeExportOptions(options))
          .replyOnce(201, auditLogExport);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.auditLogs.createExport(options)).resolves.toEqual(
          auditLogExport,
        );
      });
    });

    describe('when additional filters are defined', () => {
      it('returns `audit_log_export`', async () => {
        const options: AuditLogExportOptions = {
          actions: ['foo', 'bar'],
          actors: ['Jon', 'Smith'],
          actor_names: ['Jon', 'Smith'],
          actor_ids: ['user_foo', 'user_bar'],
          organization_id: 'org_123',
          range_end: new Date(),
          range_start: new Date(),
          targets: ['user', 'team'],
        };

        const auditLogExport: AuditLogExport = {
          object: 'audit_log_export',
          id: 'audit_log_export_1234',
          state: 'pending',
          url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mock
          .onPost('/audit_logs/exports', serializeExportOptions(options))
          .replyOnce(201, auditLogExport);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(workos.auditLogs.createExport(options)).resolves.toEqual(
          auditLogExport,
        );
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        const options: AuditLogExportOptions = {
          organization_id: 'org_123',
          range_start: new Date(),
          range_end: new Date(),
        };

        mock
          .onPost('/audit_logs/exports', serializeExportOptions(options))
          .replyOnce(
            401,
            {
              message: 'Unauthorized',
            },
            { 'X-Request-ID': 'a-request-id' },
          );

        const workos = new WorkOS('invalid apikey');

        await expect(
          workos.auditLogs.createExport(options),
        ).rejects.toStrictEqual(new UnauthorizedException('a-request-id'));
      });
    });
  });

  describe('getExport', () => {
    describe('when the api responds with a 201', () => {
      it('returns `audit_log_export`', async () => {
        const auditLogExport: AuditLogExport = {
          object: 'audit_log_export',
          id: 'audit_log_export_1234',
          state: 'pending',
          url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mock
          .onGet(`/audit_logs/exports/${auditLogExport.id}`)
          .replyOnce(200, auditLogExport);

        const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

        await expect(
          workos.auditLogs.getExport(auditLogExport.id),
        ).resolves.toEqual(auditLogExport);
      });
    });

    describe('when the api responds with a 401', () => {
      it('throws an UnauthorizedException', async () => {
        mock.onGet('/audit_logs/exports/audit_log_export_1234').replyOnce(
          401,
          {
            message: 'Unauthorized',
          },
          { 'X-Request-ID': 'a-request-id' },
        );

        const workos = new WorkOS('invalid apikey');

        await expect(
          workos.auditLogs.getExport('audit_log_export_1234'),
        ).rejects.toStrictEqual(new UnauthorizedException('a-request-id'));
      });
    });
  });
});
