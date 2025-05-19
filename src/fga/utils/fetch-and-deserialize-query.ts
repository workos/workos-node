import { WorkOS } from '../../workos';
import { QueryResultListResponse } from '../serializers/query-result.serializer';
import { deserializeQueryResultList } from '../serializers/query-result.serializer';
import { QueryRequestOptions } from '../interfaces';
import { PaginationOptions } from '../../common/interfaces';

export const fetchAndDeserializeQuery = async (
  workos: WorkOS,
  endpoint: string,
  options?: PaginationOptions,
  requestOptions?: QueryRequestOptions,
) => {
  const { data: response } = await workos.get<QueryResultListResponse>(
    endpoint,
    {
      query: options,
      ...requestOptions,
    },
  );

  return deserializeQueryResultList(response);
};
