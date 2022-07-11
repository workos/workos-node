interface AuditLogResource {
  id: string;
  name?: string;
  type: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface AuditLogActor extends AuditLogResource {}

export interface AuditLogTarget extends AuditLogResource {}

export interface AuditLogEventOptions {
  action: string;
  version?: number;
  occurred_at: Date;
  actor: AuditLogActor;
  targets: AuditLogTarget[];
  context: {
    location: string;
    user_agent?: string;
  };
  metadata?: Record<string, string | number | boolean>;
}
