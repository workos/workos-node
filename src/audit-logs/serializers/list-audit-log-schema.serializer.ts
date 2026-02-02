import {
  ListAuditLogSchemaItemResponse,
  ListedAuditLogSchema,
} from '../interfaces';

function deserializeMetadata(metadata?: {
  type: 'object';
  properties?: Record<string, { type: string | number | boolean }>;
}): Record<string, string | number | boolean> | undefined {
  if (!metadata || !metadata.properties) {
    return undefined;
  }

  const deserializedMetadata: Record<string, string | number | boolean> = {};

  Object.keys(metadata.properties).forEach((key) => {
    if (metadata.properties) {
      deserializedMetadata[key] = metadata.properties[key].type;
    }
  });

  return deserializedMetadata;
}

export const deserializeListedAuditLogSchema = (
  auditLogSchema: ListAuditLogSchemaItemResponse,
): ListedAuditLogSchema => ({
  object: auditLogSchema.object,
  version: auditLogSchema.version,
  targets: auditLogSchema.targets.map((target) => ({
    type: target.type,
    metadata: target.metadata
      ? deserializeMetadata(target.metadata)
      : undefined,
  })),
  actor: auditLogSchema.actor
    ? {
        metadata: deserializeMetadata(auditLogSchema.actor.metadata) ?? {},
      }
    : undefined,
  metadata: deserializeMetadata(auditLogSchema.metadata),
  createdAt: auditLogSchema.created_at,
});
