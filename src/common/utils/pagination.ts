import { DeserializedList, PaginationOptions } from '../interfaces';

export class AutoPaginatable<T> {
  constructor(
    private _list: DeserializedList<T>,
    private apiCall: (params: PaginationOptions) => Promise<Autopaginatable<T>>,
  ) {}

  get data() {
    return this._list.data;
  }

  get listMetadata() {
    return this._list.listMetadata;
  }

  get listParams() {
    return this._list.params;
  }

  async *generatePages(): AsyncGenerator<T[]> {
    let after = this.listMetadata.after;
    let order = this.listParams?.order;

    while (after) {
      const newlist = await this.apiCall({ order, after });
      yield newlist.data;
      after = newlist.listMetadata.after;
    }
  }

  async autoPagination(): Promise<T[]> {
    if (!this.listParams?.limit) {
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
