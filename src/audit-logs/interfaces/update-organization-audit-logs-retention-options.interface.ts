import type { UpdateAuditLogsRetentionRetentionPeriod } from './update-audit-logs-retention-retention-period.interface';

export interface UpdateOrganizationAuditLogsRetentionOptions {
  /** Unique identifier of the Organization. */
  id: string;
  /** The period Audit Log events will be retained. Valid values are `1_MONTH` through `11_MONTHS` in one-month increments and `1_YEAR` through `10_YEARS` in one-year increments. */
  retentionPeriod: UpdateAuditLogsRetentionRetentionPeriod;
}
