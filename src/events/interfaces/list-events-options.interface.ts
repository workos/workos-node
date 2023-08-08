import { EventNames } from '../../common/interfaces';

export interface ListEventOptions {
  events?: EventNames[];
  rangeStart?: string;
  rangeEnd?: string;
  limit?: number;
  after?: string;
}
