import {
  AuditLogSchemaMetadata,
  CreateAuditLogSchemaOptions,
  SerializedCreateAuditLogSchemaOptions,
} from '../interfaces';

function serializeMetadata(
  metadata: Record<string, string | number | boolean> | undefined,
) {
  if (!metadata) {
    return {};
  }

  const serializedMetadata: AuditLogSchemaMetadata = {};

  Object.keys(metadata).forEach((key) => {
    serializedMetadata[key] = {
      type: metadata[key] as 'string' | 'number' | 'boolean',
    };
  });

  return serializedMetadata;
}

export const serializeCreateAuditLogSchemaOptions = (
  schema: CreateAuditLogSchemaOptions,
): SerializedCreateAuditLogSchemaOptions => ({
  actor: {
    metadata: {
      type: 'object',
      properties: serializeMetadata(schema.actor?.metadata),
    },
  },
  targets: schema.targets.map((target) => {
    return {
      type: target.type,
      metadata: target.metadata
        ? {
            type: 'object',
            properties: serializeMetadata(target.metadata),
          }
        : undefined,
    };
  }),
  metadata: schema.metadata
    ? {
        type: 'object',
        properties: serializeMetadata(schema.metadata),
      }
    : undefined,
});
