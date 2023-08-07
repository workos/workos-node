import { DeserializedList, PaginationOptions } from '../interfaces';

export class AutoPaginatable<T> {
  private readonly options: PaginationOptions;

  constructor(
    private list: DeserializedList<T>,
    private apiCall: (params: PaginationOptions) => Promise<AutoPaginatable<T>>,
    options?: PaginationOptions
  ){
    this.options = {
      ...options
    };
  }

  get data() {
    return this.list.data;
  }

  get listMetadata() {
    return this.list.listMetadata;
  }

  async *generatePages(): AsyncGenerator<T[]> {
    let after = this.listMetadata.after;

    while (after) {
      const newlist = await this.apiCall({ ...this.options, after });
      yield newlist.data;
      after = newlist.listMetadata.after;
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
