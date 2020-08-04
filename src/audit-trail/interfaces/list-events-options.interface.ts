import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface ListEventsOptions extends PaginationOptions {
  group?: string[];
  action?: string[];
  action_type?: string[];
  actor_name?: string[];
  actor_id?: string[];
  target_name?: string[];
  target_id?: string[];
  occurred_at?: string;
  occurred_at_gt?: string;
  occurred_at_gte?: string;
  occurred_at_lt?: string;
  occurred_at_lte?: string;
  search?: string;
}
