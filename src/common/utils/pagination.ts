// @oagen-ignore-file
import { List, PaginationOptions } from '../interfaces';

export class AutoPaginatable<
  ResourceType,
  ParametersType extends PaginationOptions = PaginationOptions,
> {
  readonly object = 'list' as const;
  readonly options: ParametersType;

  constructor(
    protected list: List<ResourceType>,
    private apiCall: (params: PaginationOptions) => Promise<List<ResourceType>>,
    options?: ParametersType,
  ) {
    this.options = options ?? ({} as ParametersType);
  }

  get data(): ResourceType[] {
    return this.list.data;
  }

  get listMetadata() {
    return this.list.listMetadata;
  }

  private get direction(): 'forward' | 'backward' {
    return this.options.before && !this.options.after ? 'backward' : 'forward';
  }

  private async *generatePages(
    params: PaginationOptions,
  ): AsyncGenerator<ResourceType[]> {
    const { before, after, ...options } = this.options;
    const result = await this.apiCall({
      ...options,
      limit: 100,
      ...(this.direction === 'backward'
        ? { before: params.before }
        : { after: params.after }),
    });

    yield this.direction === 'backward'
      ? [...result.data].reverse()
      : result.data;

    const nextCursor =
      this.direction === 'backward'
        ? result.listMetadata.before
        : result.listMetadata.after;

    if (nextCursor) {
      // Delay of 4rps to respect list users rate limits
      await new Promise((resolve) => setTimeout(resolve, 350));
      yield* this.generatePages(
        this.direction === 'backward'
          ? { before: nextCursor }
          : { after: nextCursor },
      );
    }
  }

  /**
   * Automatically paginates over the list of results, returning the complete data set.
   * Returns the first result if `options.limit` is passed to the first request.
   */
  async autoPagination(): Promise<ResourceType[]> {
    if (this.options.limit) {
      return this.data;
    }

    const results: ResourceType[] = [];

    for await (const page of this.generatePages({
      before: this.options.before,
      after: this.options.after,
    })) {
      results.push(...page);
    }

    return results;
  }
}
