import { AutoPaginatable } from '../../common/utils/pagination';
import { FGAList } from '../interfaces/list.interface';
import { Warning } from '../interfaces/warning.interface';
import { PaginationOptions } from '../../common/interfaces';

export class FgaPaginatable<
  T,
  P extends PaginationOptions = PaginationOptions,
> extends AutoPaginatable<T, P> {
  protected override list: FGAList<T>;

  constructor(
    list: FGAList<T>,
    apiCall: (params: PaginationOptions) => Promise<FGAList<T>>,
    options?: P,
  ) {
    super(list, apiCall, options);
    this.list = list;
  }

  get warnings(): Warning[] | undefined {
    return this.list.warnings;
  }
}
