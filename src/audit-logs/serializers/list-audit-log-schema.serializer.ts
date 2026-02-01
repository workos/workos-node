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
  schema: ListAuditLogSchemaItemResponse,
): ListedAuditLogSchema => ({
  object: schema.object,
  version: schema.version,
  targets: schema.targets.map((target) => ({
    type: target.type,
    metadata: target.metadata
      ? deserializeMetadata(target.metadata)
      : undefined,
  })),
  actor: schema.actor
    ? {
        metadata: deserializeMetadata(schema.actor.metadata) ?? {},
      }
    : undefined,
  metadata: deserializeMetadata(schema.metadata),
  createdAt: schema.created_at,
});
