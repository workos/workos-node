export interface AuditLogExportOptions {
  actions?: string[];
  actorNames?: string[];
  actorIds?: string[];
  organizationId: string;
  rangeEnd: string;
  rangeStart: string;
  targets?: string[];
}
