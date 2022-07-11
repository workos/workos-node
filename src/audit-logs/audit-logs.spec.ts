import axios from 'axios';
import MockAdapater from 'axios-mock-adapter';

import { UnauthorizedException } from '../common/exceptions';
import { BadRequestException } from '../common/exceptions/bad-request.exception';
import { WorkOS } from '../workos';
import { AuditLogEventOptions } from './interfaces';

const mock = new MockAdapater(axios);
const event: AuditLogEventOptions = {
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

const serializeEventOptions = (options: AuditLogEventOptions) => ({
  ...options,
  occurred_at: options.occurred_at.toISOString(),
});

describe('AuditLogs', () => {
  describe('createEvent', () => {
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
});
