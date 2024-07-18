import {
  ListWarrantsOptions,
  SerializedListWarrantsOptions,
} from '../interfaces';

export const serializeListWarrantsOptions = (
  options: ListWarrantsOptions,
): SerializedListWarrantsOptions => ({
  resource_type: options.resourceType,
  resource_id: options.resourceId,
  relation: options.relation,
  subject_type: options.subjectType,
  subject_id: options.subjectId,
  subject_relation: options.subjectRelation,
  limit: options.limit,
  after: options.after,
});
