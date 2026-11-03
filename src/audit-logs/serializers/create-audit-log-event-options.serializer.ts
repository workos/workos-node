import {
  CreateAuditLogEventOptions,
  SerializedCreateAuditLogEventOptions,
} from '../interfaces';

export const serializeCreateAuditLogEventOptions = (
  event: CreateAuditLogEventOptions,
): SerializedCreateAuditLogEventOptions => ({
  action: event.action,
  version: event.version,
  ...(event.occurredAt === undefined
    ? {}
    : { occurred_at: event.occurredAt.toISOString() }),
  actor: event.actor,
  targets: event.targets,
  context: {
    location: event.context.location,
    user_agent: event.context.userAgent,
  },
  metadata: event.metadata,
});
