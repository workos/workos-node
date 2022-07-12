import { WorkOS } from '../workos';
import {
  CreateAuditLogEventOptions,
  CreateAuditLogEventRequestOptions,
} from './interfaces';

export class AuditLogs {
  constructor(private readonly workos: WorkOS) {}

  async createEvent(
    { organization }: { organization: string },
    event: CreateAuditLogEventOptions,
    options: CreateAuditLogEventRequestOptions = {},
  ): Promise<void> {
    await this.workos.post(
      '/audit_logs/events',
      {
        event,
        organization_id: organization,
      },
      options,
    );
  }
}
