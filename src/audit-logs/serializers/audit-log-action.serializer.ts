import {
  AuditLogAction,
  AuditLogActionResponse,
} from '../interfaces/audit-log-action.interface';

/**
 * Deserializes an audit log action response from the API.
 * The API response is already in the correct format, so this is a simple passthrough.
 */
export const deserializeAuditLogAction = (
  response: AuditLogActionResponse,
): AuditLogAction => ({
  object: response.object,
  name: response.name,
});
