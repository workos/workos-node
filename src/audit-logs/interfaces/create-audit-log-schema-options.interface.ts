import { PostOptions } from '../../common/interfaces';

// Re-export common types for backward compatibility
export {
  AuditLogSchema,
  AuditLogSchemaResponse,
  AuditLogSchemaMetadata,
  AuditLogActorSchema,
  AuditLogTargetSchema,
} from './audit-log-schema.interface';

import type {
  AuditLogSchemaMetadata,
  AuditLogSchemaResponse,
  AuditLogActorSchema,
  AuditLogTargetSchema,
} from './audit-log-schema.interface';

/**
 * Options for creating a new audit log schema.
 */
export interface CreateAuditLogSchemaOptions {
  action: string;
  targets: AuditLogTargetSchema[];
  actor?: AuditLogActorSchema;
  metadata?: Record<string, string | boolean | number>;
}

interface SerializedAuditLogTargetSchema {
  type: string;
  metadata?: {
    type: 'object';
    properties: AuditLogSchemaMetadata;
  };
}

/**
 * Serialized format for creating audit log schema (sent to API).
 */
export interface SerializedCreateAuditLogSchemaOptions {
  targets: SerializedAuditLogTargetSchema[];
  actor?: {
    metadata: {
      type: 'object';
      properties: AuditLogSchemaMetadata;
    };
  };
  metadata?: {
    type: 'object';
    properties: AuditLogSchemaMetadata;
  };
}

/** @deprecated Use AuditLogSchemaResponse instead */
export type CreateAuditLogSchemaResponse = AuditLogSchemaResponse;

export type CreateAuditLogSchemaRequestOptions = Pick<
  PostOptions,
  'idempotencyKey'
>;
