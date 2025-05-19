import { AutoPaginatable } from '../../common/utils/pagination';
import { Warning } from '../interfaces/warning.interface';

export class FgaPaginatable<T> extends AutoPaginatable<T> {
  get warnings(): Warning[] | undefined {
    return (this as any).list.warnings;
  }
}
