import { DeserializedList, List } from '../interfaces';

export const deserializeList = <TSerialized, TDeserialized>(
  list: List<TSerialized>,
  deserializer: (serialized: TSerialized) => TDeserialized,
): DeserializedList<TDeserialized> => ({
  object: 'list',
  data: list.data.map(deserializer),
  listMetadata: list.list_metadata,
});
