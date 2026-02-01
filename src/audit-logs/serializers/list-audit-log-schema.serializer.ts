import {
  ListAuditLogSchemaItemResponse,
  ListedAuditLogSchema,
} from '../interfaces';

export const deserializeListedAuditLogSchema = (
  schema: ListAuditLogSchemaItemResponse,
): ListedAuditLogSchema => ({
  object: schema.object,
  version: schema.version,
  targets: schema.targets,
  actor: schema.actor,
  metadata: schema.metadata,
  createdAt: schema.created_at,
});
