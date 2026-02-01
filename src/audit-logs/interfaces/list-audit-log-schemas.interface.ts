import {
  AuditLogSchemaActor,
  AuditLogSchemaTarget,
  JsonSchemaDefinition,
} from './create-audit-log-schema-options.interface';

/**
 * API response for a single schema item in the list schemas endpoint.
 * Note: List items use `updated_at` instead of `created_at` and don't have an `object` field.
 */
export interface ListAuditLogSchemaItemResponse {
  object: 'audit_log_schema';
  version: number;
  targets: AuditLogSchemaTarget[];
  actor?: AuditLogSchemaActor;
  metadata?: JsonSchemaDefinition;
  created_at: string;
}

/**
 * Deserialized audit log schema from the list schemas endpoint.
 */
export interface ListedAuditLogSchema {
  object: 'audit_log_schema';
  version: number;
  targets: AuditLogSchemaTarget[];
  actor?: AuditLogSchemaActor;
  metadata?: JsonSchemaDefinition;
  createdAt: string;
}
