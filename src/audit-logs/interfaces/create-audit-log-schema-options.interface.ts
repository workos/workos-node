import { PostOptions } from '../../common/interfaces';

export type AuditLogSchemaMetadata =
  | Record<string, { type: 'string' | 'boolean' | 'number' }>
  | undefined;

export interface AuditLogSchema {
  object: 'audit_log_schema';
  version: number;
  targets: AuditLogTargetSchema[];
  actor: AuditLogActorSchema;
  metadata: Record<string, string> | undefined;
  createdAt: string;
}

export interface AuditLogActorSchema {
  metadata: Record<string, string> | undefined;
}

export interface AuditLogTargetSchema {
  type: string;
  metadata?: Record<string, string> | undefined;
}

export interface CreateAuditLogSchemaOptions {
  action: string;
  targets: AuditLogTargetSchema[];
  actor?: AuditLogActorSchema;
  metadata?: Record<string, string>;
}

interface SerializedAuditLogTargetSchema {
  type: string;
  metadata?: {
    type: 'object';
    properties: Record<string, { type: string }>;
  };
}

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

export interface CreateAuditLogSchemaResponse {
  object: 'audit_log_schema';
  version: number;
  targets: SerializedAuditLogTargetSchema[];
  actor: {
    metadata: {
      type: 'object';
      properties: AuditLogSchemaMetadata;
    };
  };
  metadata: {
    type: 'object';
    properties: AuditLogSchemaMetadata;
  };
  created_at: string;
}

export type CreateAuditLogSchemaRequestOptions = Pick<
  PostOptions,
  'idempotencyKey'
>;
