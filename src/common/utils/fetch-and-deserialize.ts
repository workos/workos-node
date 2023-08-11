import { WorkOS } from '../../workos';
import { List, ListResponse, PaginationOptions } from '../interfaces';
import { deserializeList } from '../serializers';

function setDefaultOptions(options?: PaginationOptions): PaginationOptions {
  return {
    ...options,
    order: options?.order || 'desc',
  };
}

export async function fetchAndDeserialize<T, U>(
  workos: WorkOS,
  endpoint: string,
  deserializeFn: (data: T) => U,
  options?: PaginationOptions,
): Promise<List<U>> {
  const finalOptions = setDefaultOptions(options);

  const { data } = await workos.get<ListResponse<T>>(endpoint, {
    query: finalOptions,
  });

  return deserializeList(data, deserializeFn);
}
