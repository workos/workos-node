import { List, PaginationOptions } from '../interfaces';

export class AutoPaginatable<T> {
  readonly object: 'list' = 'list';
  private readonly options: PaginationOptions;

  constructor(
    private list: List<T>,
    private apiCall: (params: PaginationOptions) => Promise<List<T>>,
    options?: PaginationOptions,
  ) {
    this.options = {
      ...options,
    };
  }

  get data(): T[] {
    return this.list.data;
  }

  get listMetadata() {
    return this.list.listMetadata;
  }

  async *generatePages(): AsyncGenerator<T[]> {
    let after = this.listMetadata.after;

    while (after) {
      const newList = await this.apiCall({ ...this.options, after });
      yield newList.data;
      after = newList.listMetadata.after;
    }
  }

  async autoPagination(): Promise<T[]> {
    if (!this.options.limit) {
      const results: T[] = [];
      for await (const page of this.generatePages()) {
        results.push(...page);
      }
      return results;
    } else {
      return this.data;
    }
  }
}
