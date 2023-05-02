export interface AuditLogExportOptions {
  actions?: string[];
  /**
   * @deprecated Please use `actor_names` instead.
   */
  actors?: string[];
  actor_names?: string[];
  actor_ids?: string[];
  organization_id: string;
  range_end: Date;
  range_start: Date;
  targets?: string[];
}
