export interface List<T> {
  readonly object: 'list';
  data: T[];
  list_metadata: {
    before?: string;
    after?: string;
  };
}

export interface DeserializedList<T> {
  readonly object: 'list';
  data: T[];
  listMetadata: {
    before?: string;
    after?: string;
  };
}
