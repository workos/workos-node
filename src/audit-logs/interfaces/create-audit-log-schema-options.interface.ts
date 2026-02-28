import { PostOptions } from '../../common/interfaces';

import type {
  AuditLogSchemaMetadata,
  AuditLogSchemaResponse,
  AuditLogActorSchema,
  AuditLogTargetSchema,
} from './audit-log-schema.interface';

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
