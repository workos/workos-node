import { PaginationOptions } from '../../common/interfaces';

/**
 * Represents an Audit Log Action in the WorkOS system.
 * Actions define the types of events that can be logged.
 */
export interface AuditLogAction {
  /** The object type, always 'audit_log_action' */
  object: 'audit_log_action';
  /** The unique identifier for the action (e.g., 'user.logged_in') */
  name: string;
}

/**
 * API response format for an audit log action.
 */
export interface AuditLogActionResponse {
  object: 'audit_log_action';
  name: string;
}

/**
 * Options for listing audit log actions.
 */
export type ListActionsOptions = PaginationOptions;
