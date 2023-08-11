import { WorkOS } from '../../workos';
import { List, ListResponse, PaginationOptions } from '../interfaces';
import { deserializeList } from '../serializers';

export function SetDefaultOptions(options?: PaginationOptions): PaginationOptions {
  return {
    ...options,
    order: options?.order || 'desc',
  };
}

export async function FetchAndDeserialize<T, U>(
  workos: WorkOS,
  endpoint: string,
  deserializeFn: (data: T) => U,
  options: PaginationOptions,
): Promise<List<U>> {
  const { data } = await workos.get<ListResponse<T>>(endpoint, {
    query: options,
  });

  return deserializeList(data, deserializeFn);
}


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

      let results: T[] = [];

      for await (const page of generatePages) {
        results.push(...page);
      }

      return results;
    } else {
      return this.data;
    }
  }
}
