export type ResourceExportResourceType =
  | 'users'
  | 'organizations'
  | 'events'
  | 'sessions'
  | 'auditLogEvents'
  | 'connections'
  | 'directoryUsers'
  | 'scimLogs';

export interface ResourceExportEventData {
  id: string;
  resourceType: ResourceExportResourceType;
}

export interface ResourceExportEventResponseData {
  id: string;
  resource_type: ResourceExportResourceType;
}
