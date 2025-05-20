import { FGAList } from '../interfaces/list.interface';
import { ListResponse } from '../../common/interfaces';

export const deserializeFGAList = <T, U>(
  response: ListResponse<T> & { warnings?: any[] },
  deserializeFn: (data: T) => U,
): FGAList<U> => ({
  object: 'list',
  data: response.data.map(deserializeFn),
  listMetadata: response.list_metadata,
  warnings: response.warnings,
});
