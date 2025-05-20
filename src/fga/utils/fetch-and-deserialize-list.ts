import { WorkOS } from '../../workos';
import { FGAList } from '../interfaces/list.interface';
import { QueryRequestOptions } from '../interfaces';
import { PaginationOptions } from '../../common/interfaces';
import { ListResponse } from '../../common/interfaces';
import { deserializeFGAList } from '../serializers/list.serializer';

export const fetchAndDeserializeFGAList = async <T, U>(
  workos: WorkOS,
  endpoint: string,
  deserializeFn: (data: T) => U,
  options?: PaginationOptions,
  requestOptions?: QueryRequestOptions,
): Promise<FGAList<U>> => {
  const { data: response } = await workos.get<
    ListResponse<T> & { warnings?: any[] }
  >(endpoint, {
    query: options,
    ...requestOptions,
  });

  return deserializeFGAList(response, deserializeFn);
};
