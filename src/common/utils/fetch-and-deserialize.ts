import { WorkOS } from '../../workos';
import { List, ListResponse, PaginationOptions } from '../interfaces';
import { deserializeList } from '../serializers';

const setDefaultOptions = (options?: PaginationOptions): PaginationOptions => {
  return {
    ...options,
    order: options?.order || 'desc',
  };
};

export const fetchAndDeserialize = async <T, U>(
  workos: WorkOS,
  endpoint: string,
  deserializeFn: (data: T) => U,
  options?: PaginationOptions,
): Promise<List<U>> => {
  const { data } = await workos.get<ListResponse<T>>(endpoint, {
    query: setDefaultOptions(options),
  });

  return deserializeList(data, deserializeFn);
};
