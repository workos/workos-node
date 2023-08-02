import { AuditLogExport, AuditLogExportResponse } from '../interfaces';

export const deserializeAuditLogExport = (
  auditLogExport: AuditLogExportResponse,
): AuditLogExport => ({
  object: auditLogExport.object,
  id: auditLogExport.id,
  state: auditLogExport.state,
  url: auditLogExport.url,
  createdAt: auditLogExport.created_at,
  updatedAt: auditLogExport.updated_at,
});
