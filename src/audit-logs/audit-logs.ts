import { WorkOS } from '../workos';
import { deserializeAuditLogExport } from './deserializers/audit-log-export.deserializer';
import {
  CreateAuditLogEventOptions,
  CreateAuditLogEventRequestOptions,
} from './interfaces';
import { AuditLogExportOptions } from './interfaces/audit-log-export-options.interface';
import {
  AuditLogExport,
  AuditLogExportResponse,
} from './interfaces/audit-log-export.interface';
import { serializeCreateAuditLogEventOptions } from './serializers';
import { serializeAuditLogExportOptions } from './serializers/audit-log-export-options.serializer';

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
        event: serializeCreateAuditLogEventOptions(event),
        organization_id: organization,
      },
      options,
    );
  }

  async createExport(options: AuditLogExportOptions): Promise<AuditLogExport> {
    const { data } = await this.workos.post<AuditLogExportResponse>(
      '/audit_logs/exports',
      serializeAuditLogExportOptions(options),
    );

    return deserializeAuditLogExport(data);
  }

  async getExport(auditLogExportId: string): Promise<AuditLogExport> {
    const { data } = await this.workos.get<AuditLogExportResponse>(
      `/audit_logs/exports/${auditLogExportId}`,
    );

    return deserializeAuditLogExport(data);
  }
}
