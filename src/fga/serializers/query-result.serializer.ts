import { QueryResult, QueryResultResponse } from '../interfaces';
import { Warning } from '../interfaces/warning.interface';
import { ListResponse } from '../../common/interfaces';

export interface QueryResultListResponse
  extends ListResponse<QueryResultResponse> {
  warnings?: Warning[];
}

export const deserializeQueryResult = (
  queryResult: QueryResultResponse,
): QueryResult => ({
  resourceType: queryResult.resource_type,
  resourceId: queryResult.resource_id,
  relation: queryResult.relation,
  warrant: {
    resourceType: queryResult.warrant.resource_type,
    resourceId: queryResult.warrant.resource_id,
    relation: queryResult.warrant.relation,
    subject: {
      resourceType: queryResult.warrant.subject.resource_type,
      resourceId: queryResult.warrant.subject.resource_id,
      relation: queryResult.warrant.subject.relation,
    },
  },
  isImplicit: queryResult.is_implicit,
  meta: queryResult.meta,
});
