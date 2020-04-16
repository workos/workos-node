export interface List<T> {
  data: T[];

  listMetadata: {
    before?: string;
    after?: string;
  };
}
