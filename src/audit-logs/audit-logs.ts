import { WorkOS } from '../workos';
import {
  CreateAuditLogEventOptions,
  CreateAuditLogEventRequestOptions,
} from './interfaces';
import { AuditLogExportOptions } from './interfaces/audit-log-export-options.interface';
import {
  AuditLogExport,
  AuditLogExportResponse,
} from './interfaces/audit-log-export.interface';
import {
  AuditLogSchema,
  CreateAuditLogSchemaOptions,
  CreateAuditLogSchemaRequestOptions,
  CreateAuditLogSchemaResponse,
} from './interfaces/create-audit-log-schema-options.interface';
import {
  deserializeAuditLogExport,
  serializeAuditLogExportOptions,
  serializeCreateAuditLogEventOptions,
  serializeCreateAuditLogSchemaOptions,
  deserializeAuditLogSchema,
} from './serializers';

export class AuditLogs {
  constructor(private readonly workos: WorkOS) {}

  async createEvent(
    organization: string,
    event: CreateAuditLogEventOptions,
    options: CreateAuditLogEventRequestOptions = {},
  ): Promise<void> {
    // Auto-generate idempotency key if not provided
    const optionsWithIdempotency: CreateAuditLogEventRequestOptions = {
      ...options,
      idempotencyKey:
        options.idempotencyKey ||
        `workos-node-${this.workos.getCryptoProvider().randomUUID()}`,
    };

    await this.workos.post(
      '/audit_logs/events',
      {
        event: serializeCreateAuditLogEventOptions(event),
        organization_id: organization,
      },
      optionsWithIdempotency,
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

  async createSchema(
    schema: CreateAuditLogSchemaOptions,
    options: CreateAuditLogSchemaRequestOptions = {},
  ): Promise<AuditLogSchema> {
    const { data } = await this.workos.post<CreateAuditLogSchemaResponse>(
      `/audit_logs/actions/${schema.action}/schemas`,
      serializeCreateAuditLogSchemaOptions(schema),
      options,
    );

    return deserializeAuditLogSchema(data);
  }
}
