import { Warrant, WarrantResponse } from '../interfaces';

export const deserializeWarrant = (warrant: WarrantResponse): Warrant => ({
  resourceType: warrant.resource_type,
  resourceId: warrant.resource_id,
  relation: warrant.relation,
  subject: {
    resourceType: warrant.subject.resource_type,
    resourceId: warrant.subject.resource_id,
    relation: warrant.subject.relation,
  },
  policy: warrant.policy,
});
