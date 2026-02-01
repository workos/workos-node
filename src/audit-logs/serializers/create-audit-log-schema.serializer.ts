import { AuditLogSchema, CreateAuditLogSchemaResponse } from '../interfaces';

export const deserializeAuditLogSchema = (
  auditLogSchema: CreateAuditLogSchemaResponse,
): AuditLogSchema => ({
  object: auditLogSchema.object,
  version: auditLogSchema.version,
  targets: auditLogSchema.targets,
  actor: auditLogSchema.actor,
  metadata: auditLogSchema.metadata,
  createdAt: auditLogSchema.created_at,
});
