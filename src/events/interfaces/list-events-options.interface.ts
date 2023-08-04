import { EventNames } from './event.interface';

export interface ListEventOptions {
  events?: EventNames[];
  rangeStart?: string;
  rangeEnd?: string;
  limit?: number;
  after?: string;
}
