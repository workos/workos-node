import { AuditLogSchema, CreateAuditLogSchemaResponse } from '../interfaces';

function deserializeMetadata(metadata: {
  properties?: Record<string, { type: string | number | boolean }>;
}): Record<string, string | number | boolean> {
  if (!metadata || !metadata.properties) {
    return {};
  }

  const deserializedMetadata: Record<string, string | number | boolean> = {};

  Object.keys(metadata.properties).forEach((key) => {
    if (metadata.properties) {
      deserializedMetadata[key] = metadata.properties[key].type;
    }
  });

  return deserializedMetadata;
}

export const deserializeAuditLogSchema = (
  auditLogSchema: CreateAuditLogSchemaResponse,
): AuditLogSchema => ({
  object: auditLogSchema.object,
  version: auditLogSchema.version,
  targets: auditLogSchema.targets.map((target) => {
    return {
      type: target.type,
      metadata: target.metadata
        ? deserializeMetadata(target.metadata)
        : undefined,
    };
  }),
  actor: {
    metadata: deserializeMetadata(auditLogSchema.actor?.metadata),
  },
  metadata: auditLogSchema.metadata
    ? deserializeMetadata(auditLogSchema.metadata)
    : undefined,
  createdAt: auditLogSchema.created_at,
});
