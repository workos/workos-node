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

  /**
   * Create Event
   *
   * Create an Audit Log Event.
   *
   * This API supports idempotency which guarantees that performing the same operation multiple times will have the same result as if the operation were performed only once. This is handy in situations where you may need to retry a request due to a failure or prevent accidental duplicate requests from creating more than one resource.
   *
   * To achieve idempotency, you can add `Idempotency-Key` request header to a Create Event request with a unique string as the value. Each subsequent request matching this unique string will return the same response. We suggest using [v4 UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier) for idempotency keys to avoid collisions.
   *
   * Idempotency keys expire after 24 hours. The API will generate a new response if you submit a request with an expired key.
   * @param payload - Object containing organizationId, event.
   * @returns {Promise<void>}
   * @throws {BadRequestException} 400
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   * @throws {RateLimitExceededException} 429
   */
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
        `workos-node-${globalThis.crypto.randomUUID()}`,
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

  /**
   * Create Export
   *
   * Create an Audit Log Export. Exports are scoped to a single organization within a specified date range.
   * @param payload - Object containing organizationId, rangeStart, rangeEnd.
   * @returns {Promise<AuditLogExport>}
   * @throws {BadRequestException} 400
   */
  async createExport(options: AuditLogExportOptions): Promise<AuditLogExport> {
    const { data } = await this.workos.post<AuditLogExportResponse>(
      '/audit_logs/exports',
      serializeAuditLogExportOptions(options),
    );

    return deserializeAuditLogExport(data);
  }

  /**
   * Get Export
   *
   * Get an Audit Log Export. The URL will expire after 10 minutes. If the export is needed again at a later time, refetching the export will regenerate the URL.
   * @param auditLogExportId - The unique ID of the Audit Log Export.
   * @example "audit_log_export_01GBZK5MP7TD1YCFQHFR22180V"
   * @returns {Promise<AuditLogExport>}
   * @throws {NotFoundException} 404
   */
  async getExport(auditLogExportId: string): Promise<AuditLogExport> {
    const { data } = await this.workos.get<AuditLogExportResponse>(
      `/audit_logs/exports/${auditLogExportId}`,
    );

    return deserializeAuditLogExport(data);
  }

  /**
   * Create Schema
   *
   * Creates a new Audit Log schema used to validate the payload of incoming Audit Log Events. If the `action` does not exist, it will also be created.
   * @param payload - Object containing targets.
   * @returns {Promise<AuditLogSchema>}
   * @throws {UnprocessableEntityException} 422
   */
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
