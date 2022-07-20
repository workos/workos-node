export interface AuditLogExportOptions {
  actions?: string[];
  actors?: string[];
  organization_id: string;
  range_end: Date;
  range_start: Date;
  targets?: string[];
}
