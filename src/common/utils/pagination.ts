import { List, PaginationOptions } from '../interfaces';

export class AutoPaginatable<T> {
  readonly object: 'list' = 'list';
  readonly options: PaginationOptions;

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

  async *generatePages(params: PaginationOptions): AsyncGenerator<T[]> {
    const result = await this.apiCall({
      ...this.options,
      after: params.after,
    });

    yield result.data;

    if (result.listMetadata.after) {
      yield* this.generatePages({ after: result.listMetadata.after });
    }
  }

  async autoPagination(): Promise<T[]> {
    if (!this.options.limit) {
      const generatePages = this.generatePages({
        after: this.options.after,
      });

      const results: T[] = [];

      for await (const page of generatePages) {
        results.push(...page);
      }

      return results;
    } else {
      return this.data;
    }
  }
}
