import {
  ListAuditLogSchemaItemResponse,
  ListedAuditLogSchema,
} from '../interfaces';

/**
 * Deserializes an audit log schema from the list schemas API response.
 * Converts snake_case fields to camelCase while preserving metadata
 * in its raw JSON Schema format.
 */
export const deserializeListedAuditLogSchema = (
  auditLogSchema: ListAuditLogSchemaItemResponse,
): ListedAuditLogSchema => ({
  object: auditLogSchema.object,
  version: auditLogSchema.version,
  targets: auditLogSchema.targets.map((target) => ({
    type: target.type,
    metadata: target.metadata,
  })),
  actor: auditLogSchema.actor,
  metadata: auditLogSchema.metadata,
  createdAt: auditLogSchema.created_at,
});
