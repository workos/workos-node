import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface GetEventOptions extends PaginationOptions {
  events?: string[];
  rangeStart?: string;
  rangeEnd?: string;
}
