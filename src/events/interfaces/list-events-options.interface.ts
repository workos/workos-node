import { EventName } from '../../common/interfaces';

export interface ListEventOptions {
  events: EventName[];
  rangeStart?: string;
  rangeEnd?: string;
  limit?: number;
  after?: string;
  organizationId?: string;
  order?: 'asc' | 'desc';
}

export interface SerializedListEventOptions {
  events: EventName[];
  range_start?: string;
  range_end?: string;
  limit?: number;
  after?: string;
  organization_id?: string;
  order?: 'asc' | 'desc';
}
