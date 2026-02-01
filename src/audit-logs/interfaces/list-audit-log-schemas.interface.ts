import { AuditLogSchemaMetadata } from './create-audit-log-schema-options.interface';

/**
 * Target schema in the raw API response format.
 */
interface ListAuditLogSchemaTargetResponse {
  type: string;
  metadata?: {
    type: 'object';
    properties: AuditLogSchemaMetadata;
  };
}

/**
 * Actor schema in the raw API response format.
 */
interface ListAuditLogSchemaActorResponse {
  metadata: {
    type: 'object';
    properties: AuditLogSchemaMetadata;
  };
}

/**
 * API response for a single schema item in the list schemas endpoint.
 */
export interface ListAuditLogSchemaItemResponse {
  object: 'audit_log_schema';
  version: number;
  targets: ListAuditLogSchemaTargetResponse[];
  actor?: ListAuditLogSchemaActorResponse;
  metadata?: {
    type: 'object';
    properties: AuditLogSchemaMetadata;
  };
  created_at: string;
}

/**
 * Deserialized audit log schema from the list schemas endpoint.
 * Uses the same deserialized format as AuditLogSchema for consistency.
 */
export interface ListedAuditLogSchema {
  object: 'audit_log_schema';
  version: number;
  targets: Array<{
    type: string;
    metadata?: Record<string, string | boolean | number>;
  }>;
  actor?: {
    metadata: Record<string, string | boolean | number>;
  };
  metadata?: Record<string, string | boolean | number>;
  createdAt: string;
}
