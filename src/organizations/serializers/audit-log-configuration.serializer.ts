import {
  AuditLogConfiguration,
  AuditLogConfigurationResponse,
  AuditLogRetention,
  AuditLogRetentionResponse,
  AuditLogStream,
  AuditLogStreamResponse,
} from '../interfaces';

/**
 * Deserializes an audit log stream response from the API.
 */
const deserializeAuditLogStream = (
  stream: AuditLogStreamResponse,
): AuditLogStream => ({
  id: stream.id,
  type: stream.type,
  state: stream.state,
  lastSyncedAt: stream.last_synced_at,
  createdAt: stream.created_at,
});

/**
 * Deserializes an audit log configuration response from the API.
 */
export const deserializeAuditLogConfiguration = (
  response: AuditLogConfigurationResponse,
): AuditLogConfiguration => ({
  organizationId: response.organization_id,
  retentionPeriodInDays: response.retention_period_in_days,
  state: response.state,
  logStream: response.log_stream
    ? deserializeAuditLogStream(response.log_stream)
    : undefined,
});

/**
 * Deserializes an audit log retention response from the API.
 */
export const deserializeAuditLogRetention = (
  response: AuditLogRetentionResponse,
): AuditLogRetention => ({
  retentionPeriodInDays: response.retention_period_in_days,
});
