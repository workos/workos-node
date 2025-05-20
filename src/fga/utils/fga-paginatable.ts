import { AutoPaginatable } from '../../common/utils/pagination';
import { FGAList } from '../interfaces/list.interface';
import { Warning } from '../interfaces/warning.interface';
import { PaginationOptions } from '../../common/interfaces';

export class FgaPaginatable<T> extends AutoPaginatable<T> {
  protected override list!: FGAList<T>;

  constructor(
    list: FGAList<T>,
    apiCall: (params: PaginationOptions) => Promise<FGAList<T>>,
    options?: PaginationOptions,
  ) {
    super(list, apiCall, options);
  }

  get warnings(): Warning[] | undefined {
    return this.list.warnings;
  }
}
