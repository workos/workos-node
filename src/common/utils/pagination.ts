import { List, PaginationOptions } from '../interfaces';

export class AutoPaginatable<T> {
  readonly object = 'list' as const;
  readonly options: PaginationOptions;

  constructor(
    protected list: List<T>,
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

  private async *generatePages(params: PaginationOptions): AsyncGenerator<T[]> {
    const result = await this.apiCall({
      ...this.options,
      limit: 100,
      after: params.after,
    });

    yield result.data;

    if (result.listMetadata.after) {
      // Delay of 4rps to respect list users rate limits
      await new Promise((resolve) => setTimeout(resolve, 350));
      yield* this.generatePages({ after: result.listMetadata.after });
    }
  }

  /**
   * Automatically paginates over the list of results, returning the complete data set.
   * Returns the first result if `options.limit` is passed to the first request.
   */
  async autoPagination(): Promise<T[]> {
    if (this.options.limit) {
      return this.data;
    }

    const results: T[] = [];

    for await (const page of this.generatePages({
      after: this.options.after,
    })) {
      results.push(...page);
    }

    return results;
  }
}
