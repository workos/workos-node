import { QueryResult, QueryResultResponse } from "../interfaces";

export const deserializeQueryResult = (
  queryResult: QueryResultResponse,
): QueryResult => ({
  objectType: queryResult.object_type,
  objectId: queryResult.object_id,
  relation: queryResult.relation,
  warrant: {
    objectType: queryResult.warrant.object_type,
    objectId: queryResult.warrant.object_id,
    relation: queryResult.warrant.relation,
    subject: {
      objectType: queryResult.warrant.subject.object_type,
      objectId: queryResult.warrant.subject.object_id,
      relation: queryResult.warrant.subject.relation,
    },
  },
  isImplicit: queryResult.is_implicit,
  meta: queryResult.meta,
});
