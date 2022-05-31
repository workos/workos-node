export interface List<T> {
  readonly object: 'list';
  data: T[];
  list_metadata: {
    before?: string;
    after?: string;
  };
}
