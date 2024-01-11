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

  private async *generatePages(params: PaginationOptions): AsyncGenerator<T[]> {
    const result = await this.apiCall({
      ...this.options,
      limit: 100,
      after: params.after,
    });

    yield result.data;

    if (result.listMetadata.after) {
      // Delay of 4rps to respect list users rate limits
      await new Promise((resolve) => setTimeout(resolve, 250));
      yield* this.generatePages({ after: result.listMetadata.after });
    }
  }

  async autoPagination(): Promise<T[]> {
    // assume user only wants the exact number of records
    // they requested with the limit option
    if (this.options.limit) {
      return this.data;
    }

    const generatePages = this.generatePages({
      after: this.options.after,
    });

    const results: T[] = [];

    for await (const page of generatePages) {
      results.push(...page);
    }

    return results;
  }
}
