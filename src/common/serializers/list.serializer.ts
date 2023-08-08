import { List, ListResponse } from '../interfaces';

export const deserializeList = <TSerialized, TDeserialized>(
  list: ListResponse<TSerialized>,
  deserializer: (serialized: TSerialized) => TDeserialized,
): List<TDeserialized> => ({
  object: 'list',
  data: list.data.map(deserializer),
  listMetadata: list.list_metadata,
});
