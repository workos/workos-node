import { Resource, ResourceResponse } from '../interfaces';

export const deserializeResource = (response: ResourceResponse): Resource => ({
  resourceType: response.resource_type,
  resourceId: response.resource_id,
  meta: response.meta,
});
