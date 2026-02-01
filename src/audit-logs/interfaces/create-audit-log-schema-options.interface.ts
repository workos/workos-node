import { PostOptions } from '../../common/interfaces';

/**
 * JSON Schema definition for metadata fields.
 * This is the raw JSON schema format expected by the API.
 */
export type JsonSchemaDefinition = Record<string, unknown>;

/**
 * Audit log schema returned by the API.
 */
export interface AuditLogSchema {
  object: 'audit_log_schema';
  version: number;
  targets: AuditLogSchemaTarget[];
  actor?: AuditLogSchemaActor;
  metadata?: JsonSchemaDefinition;
  createdAt: string;
}

export interface AuditLogSchemaActor {
  metadata: JsonSchemaDefinition;
}

export interface AuditLogSchemaTarget {
  type: string;
  metadata?: JsonSchemaDefinition;
}

/**
 * Options for creating an audit log schema.
 * Metadata fields accept raw JSON schema definitions.
 */
export interface CreateAuditLogSchemaOptions {
  action: string;
  targets: AuditLogSchemaTarget[];
  actor?: AuditLogSchemaActor;
  metadata?: JsonSchemaDefinition;
}

/**
 * Serialized request body sent to the API.
 */
export interface SerializedCreateAuditLogSchemaOptions {
  targets: AuditLogSchemaTarget[];
  actor?: AuditLogSchemaActor;
  metadata?: JsonSchemaDefinition;
}

/**
 * API response for creating an audit log schema.
 */
export interface CreateAuditLogSchemaResponse {
  object: 'audit_log_schema';
  version: number;
  targets: AuditLogSchemaTarget[];
  actor?: AuditLogSchemaActor;
  metadata?: JsonSchemaDefinition;
  created_at: string;
}

export type CreateAuditLogSchemaRequestOptions = Pick<
  PostOptions,
  'idempotencyKey'
>;
