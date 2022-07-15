import { WorkOS } from '../workos';
import {
  CreateAuditLogEventOptions,
  CreateAuditLogEventRequestOptions,
} from './interfaces';
import { AuditLogExportOptions } from './interfaces/audit-log-export-options.interface';
import { AuditLogExport } from './interfaces/audit-log-export.interface';

export class AuditLogs {
  constructor(private readonly workos: WorkOS) {}

  async createEvent(
    organization: string,
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

  async createExport(options: AuditLogExportOptions): Promise<AuditLogExport> {
    const { data } = await this.workos.post('/audit_logs/exports', {
      organization_id: options.organization,
      range_start: options.range_start,
      range_end: options.range_end,
    });

    return data;
  }

  async getExport(auditLogExportId: string): Promise<AuditLogExport> {
    const { data } = await this.workos.get(
      `/audit_logs/exports/${auditLogExportId}`,
    );

    return data;
  }
}
