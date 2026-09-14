import type {
  UpdateAuditLogsRetention,
  UpdateAuditLogsRetentionResponse,
} from '../interfaces/update-audit-logs-retention.interface';

export const serializeUpdateAuditLogsRetention = (
  model: UpdateAuditLogsRetention,
): UpdateAuditLogsRetentionResponse => ({
  ...('retentionPeriod' in model && {
    retention_period: model.retentionPeriod,
  }),
  ...('retentionPeriodInDays' in model && {
    retention_period_in_days: model.retentionPeriodInDays,
  }),
});
