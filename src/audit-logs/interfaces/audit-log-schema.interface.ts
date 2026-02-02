export type AuditLogSchemaMetadata =
  | Record<string, { type: 'string' | 'boolean' | 'number' }>
  | undefined;

export interface AuditLogActorSchema {
  metadata: Record<string, string | boolean | number>;
}

export interface AuditLogTargetSchema {
  type: string;
  metadata?: Record<string, string | boolean | number>;
}

export interface AuditLogSchema {
  object: 'audit_log_schema';
  version: number;
  targets: AuditLogTargetSchema[];
  actor: AuditLogActorSchema | undefined;
  metadata: Record<string, string | boolean | number> | undefined;
  createdAt: string;
}

interface SerializedAuditLogTargetSchema {
  type: string;
  metadata?: {
    type: 'object';
    properties: AuditLogSchemaMetadata;
  };
}

export interface AuditLogSchemaResponse {
  object: 'audit_log_schema';
  version: number;
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
  created_at: string;
}
