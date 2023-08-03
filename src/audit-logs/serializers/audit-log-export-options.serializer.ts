import {
  AuditLogExportOptions,
  SerializedAuditLogExportOptions,
} from '../interfaces';

export const serializeAuditLogExportOptions = (
  options: AuditLogExportOptions,
): SerializedAuditLogExportOptions => ({
  actions: options.actions,
  actors: options.actors,
  actor_names: options.actorNames,
  actor_ids: options.actorIds,
  organization_id: options.organizationId,
  range_end: options.rangeEnd.toISOString(),
  range_start: options.rangeStart.toISOString(),
  targets: options.targets,
});
