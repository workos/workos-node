export interface AuditLogExport {
  object: 'audit_log_export';
  id: string;
  state: string;
  url?: string;
  created_at: string;
  updated_at: string;
}
