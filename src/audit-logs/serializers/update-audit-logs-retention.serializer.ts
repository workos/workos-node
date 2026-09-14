import type {
  UpdateAuditLogsRetention,
  UpdateAuditLogsRetentionResponse,
} from '../interfaces/update-audit-logs-retention.interface';

export const serializeUpdateAuditLogsRetention = (
  model: UpdateAuditLogsRetention,
): UpdateAuditLogsRetentionResponse => ({
  retention_period_in_days: model.retentionPeriodInDays,
});
