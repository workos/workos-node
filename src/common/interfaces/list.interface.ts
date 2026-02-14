export interface ListResponse<T> {
  readonly object: 'list';
  data: T[];
  list_metadata: {
    before?: string | null;
    after?: string | null;
  };
}

export interface List<T> {
  readonly object: 'list';
  data: T[];
  listMetadata: {
    before?: string | null;
    after?: string | null;
  };
}
