import type { UpdateAuditLogsRetentionRetentionPeriod } from './update-audit-logs-retention-retention-period.interface';

export interface UpdateAuditLogsRetention {
  /** The period Audit Log events will be retained. Valid values are `1_MONTH` through `11_MONTHS` in one-month increments and `1_YEAR` through `10_YEARS` in one-year increments. */
  retentionPeriod: UpdateAuditLogsRetentionRetentionPeriod;
}

export interface UpdateAuditLogsRetentionResponse {
  retention_period: UpdateAuditLogsRetentionRetentionPeriod;
}
