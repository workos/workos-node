export type AuditLogExportState = 'pending' | 'ready' | 'error' | 'expired';

export interface AuditLogExport {
  object: 'audit_log_export';
  id: string;
  state: AuditLogExportState;
  url?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogExportResponse {
  object: 'audit_log_export';
  id: string;
  state: AuditLogExportState;
  url?: string | null;
  created_at: string;
  updated_at: string;
}
