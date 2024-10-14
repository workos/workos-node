import {
  CreateAuditLogSchemaOptions,
  SerializedCreateAuditLogSchemaOptions,
} from '../interfaces';

function serializeMetadata(metadata: Record<string, string> | undefined) {
  if (!metadata) {
    return {};
  }

  const serializedMetadata: Record<string, { type: string }> = {};

  Object.keys(metadata).forEach((key) => {
    serializedMetadata[key] = {
      type: metadata[key],
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
  metadata: {
    type: 'object',
    properties: serializeMetadata(schema.metadata),
  },
});
