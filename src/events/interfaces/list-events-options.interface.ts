import { EventNames } from './event.interface';

export interface ListEventOptions {
  events?: EventNames[];
  range_start?: string;
  range_end?: string;
  limit?: number;
  after?: string;
}
