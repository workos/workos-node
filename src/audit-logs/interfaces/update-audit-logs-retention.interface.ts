import type { UpdateAuditLogsRetentionRetentionPeriod } from './update-audit-logs-retention-retention-period.interface';

export interface UpdateAuditLogsRetentionWithPeriod {
  /** The period Audit Log events will be retained. Valid values are `1_MONTH` through `11_MONTHS` in one-month increments and `1_YEAR` through `10_YEARS` in one-year increments. Mutually exclusive with `retentionPeriodInDays`. */
  retentionPeriod: UpdateAuditLogsRetentionRetentionPeriod;
}

export interface UpdateAuditLogsRetentionWithPeriodInDays {
  /**
   * The number of days Audit Log events will be retained. Valid values are `30` through `330` in 30-day increments and `365` through `3650` in 365-day increments. Mutually exclusive with `retentionPeriod`.
   * @deprecated Use `retentionPeriod` instead.
   */
  retentionPeriodInDays: number;
}

export type UpdateAuditLogsRetention =
  | UpdateAuditLogsRetentionWithPeriod
  | UpdateAuditLogsRetentionWithPeriodInDays;

export interface UpdateAuditLogsRetentionResponse {
  retention_period?: UpdateAuditLogsRetentionRetentionPeriod;
  retention_period_in_days?: number;
}
