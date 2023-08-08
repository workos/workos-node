import { EventName } from '../../common/interfaces';

export interface ListEventOptions {
  events?: EventName[];
  rangeStart?: string;
  rangeEnd?: string;
  limit?: number;
  after?: string;
}
