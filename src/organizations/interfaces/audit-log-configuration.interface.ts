/**
 * Log stream destination types for audit log forwarding.
 */
export type AuditLogStreamType =
  | 'Datadog'
  | 'Splunk'
  | 'S3'
  | 'GoogleCloudStorage'
  | 'GenericHttps';

/**
 * Audit log stream configuration.
 */
export interface AuditLogStream {
  /** Unique identifier for the log stream */
  id: string;
  /** Type of log stream destination */
  type: AuditLogStreamType;
  /** Current state of the log stream */
  state: string;
  /** ISO-8601 timestamp of last successful sync */
  lastSyncedAt: string;
  /** ISO-8601 timestamp when the stream was created */
  createdAt: string;
}

/**
 * API response format for audit log stream.
 */
export interface AuditLogStreamResponse {
  id: string;
  type: AuditLogStreamType;
  state: string;
  last_synced_at: string;
  created_at: string;
}

/**
 * Complete audit log configuration for an organization.
 */
export interface AuditLogConfiguration {
  /** The organization ID */
  organizationId: string;
  /** Number of days audit logs are retained */
  retentionPeriodInDays: number;
  /** Current state of audit logging ('active', 'inactive', or 'disabled') */
  state: 'active' | 'inactive' | 'disabled';
  /** Optional log stream configuration if forwarding is enabled */
  logStream?: AuditLogStream;
}

/**
 * API response format for audit log configuration.
 */
export interface AuditLogConfigurationResponse {
  organization_id: string;
  retention_period_in_days: number;
  state: 'active' | 'inactive' | 'disabled';
  log_stream?: AuditLogStreamResponse;
}
