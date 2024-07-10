import { ListWarrantsOptions, SerializedListWarrantsOptions } from "../interfaces";

export const serializeListWarrantsOptions = (
  options: ListWarrantsOptions,
): SerializedListWarrantsOptions => ({
  object_type: options.objectType,
  object_id: options.objectId,
  relation: options.relation,
  subject_type: options.subjectType,
  subject_id: options.subjectId,
  subject_relation: options.subjectRelation,
  limit: options.limit,
  after: options.after,
});

