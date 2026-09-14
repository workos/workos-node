import type { UpdateAuditLogsRetention } from './update-audit-logs-retention.interface';

export type UpdateOrganizationAuditLogsRetentionOptions = {
  /** Unique identifier of the Organization. */
  id: string;
} & UpdateAuditLogsRetention;
