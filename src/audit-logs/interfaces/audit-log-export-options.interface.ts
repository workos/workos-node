export interface AuditLogExportOptions {
  actions?: string[];
  actorNames?: string[];
  actorIds?: string[];
  organizationId: string;
  rangeEnd: Date;
  rangeStart: Date;
  targets?: string[];
}

export interface SerializedAuditLogExportOptions {
  actions?: string[];
  actor_names?: string[];
  actor_ids?: string[];
  organization_id: string;
  range_end: string;
  range_start: string;
  targets?: string[];
}
