/**
 * JSON Schema definition for audit log metadata fields.
 * Matches the API's AuditLogJsonSchemaDefinition (io-ts UnknownRecord).
 * This allows arbitrary JSON Schema structures as returned by the API.
 */
export type AuditLogJsonSchemaDefinition = Record<string, unknown>;

/**
 * Target schema in the API response format.
 * Metadata is an optional raw JSON Schema definition.
 */
interface ListAuditLogSchemaTargetResponse {
  type: string;
  metadata?: AuditLogJsonSchemaDefinition;
}

/**
 * Actor schema in the API response format.
 * Metadata is a required raw JSON Schema definition.
 */
interface ListAuditLogSchemaActorResponse {
  metadata: AuditLogJsonSchemaDefinition;
}

/**
 * API response for a single schema item in the list schemas endpoint.
 * Matches the AuditLogSchema type from api-json-models/rest-api/audit-log-schema.ts
 */
export interface ListAuditLogSchemaItemResponse {
  object: 'audit_log_schema';
  version: number;
  targets: ListAuditLogSchemaTargetResponse[];
  actor?: ListAuditLogSchemaActorResponse;
  metadata?: AuditLogJsonSchemaDefinition;
  created_at: string;
}

/**
 * Deserialized audit log schema from the list schemas endpoint.
 * Preserves the raw JSON Schema format for metadata fields to maintain
 * full fidelity with the API response.
 */
export interface ListedAuditLogSchema {
  object: 'audit_log_schema';
  version: number;
  targets: Array<{
    type: string;
    metadata?: AuditLogJsonSchemaDefinition;
  }>;
  actor?: {
    metadata: AuditLogJsonSchemaDefinition;
  };
  metadata?: AuditLogJsonSchemaDefinition;
  createdAt: string;
}
