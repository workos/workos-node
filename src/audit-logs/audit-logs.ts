import { WorkOS } from '../workos';
import { AuditLogEventOptions } from './interfaces';

export class AuditLogs {
  constructor(private readonly workos: WorkOS) {}

  async createEvent(
    organizationId: string,
    event: AuditLogEventOptions,
  ): Promise<void> {
    await this.workos.post('/audit_logs/events', {
      event,
      organization_id: organizationId,
    });
  }
}
