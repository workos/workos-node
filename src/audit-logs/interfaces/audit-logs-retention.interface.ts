export interface AuditLogsRetention {
  /** The number of days Audit Log events will be retained before being permanently deleted. Valid values are 30 through 330 in 30-day increments and 365 through 3650 in 365-day increments. */
  retentionPeriodInDays: number | null;
}

export interface AuditLogsRetentionResponse {
  retention_period_in_days: number | null;
}
