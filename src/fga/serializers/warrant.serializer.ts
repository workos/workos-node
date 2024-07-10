import { Warrant, WarrantResponse } from "../interfaces";

export const deserializeWarrant = (
  warrant: WarrantResponse,
): Warrant => ({
  objectType: warrant.object_type,
  objectId: warrant.object_id,
  relation: warrant.relation,
  subject: {
    objectType: warrant.subject.object_type,
    objectId: warrant.subject.object_id,
    relation: warrant.subject.relation,
  },
});
