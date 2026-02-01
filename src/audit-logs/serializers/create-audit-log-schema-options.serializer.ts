import {
  CreateAuditLogSchemaOptions,
  SerializedCreateAuditLogSchemaOptions,
} from '../interfaces';

export const serializeCreateAuditLogSchemaOptions = (
  schema: CreateAuditLogSchemaOptions,
): SerializedCreateAuditLogSchemaOptions => ({
  targets: schema.targets,
  actor: schema.actor,
  metadata: schema.metadata,
});
