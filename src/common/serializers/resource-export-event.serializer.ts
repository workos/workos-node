import {
  ResourceExportEventData,
  ResourceExportEventResponseData,
} from '../interfaces/resource-export-event.interface';

export const deserializeResourceExportEvent = (
  data: ResourceExportEventResponseData,
): ResourceExportEventData => ({
  id: data.id,
  resourceType: data.resource_type,
});
