/**
 * Audit log retention configuration for an organization.
 */
export interface AuditLogRetention {
  /** Number of days audit logs are retained (30 or 365) */
  retentionPeriodInDays: number;
}

/**
 * API response format for audit log retention.
 */
export interface AuditLogRetentionResponse {
  retention_period_in_days: number;
}

/**
 * Options for setting audit log retention for an organization.
 */
export interface SetAuditLogRetentionOptions {
  /** The ID of the organization */
  organizationId: string;
  /** Number of days to retain audit logs (30 or 365) */
  retentionPeriodInDays: number;
}
