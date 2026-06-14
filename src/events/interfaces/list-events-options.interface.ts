import { EventName } from '../../common/interfaces';

export interface ListEventOptions {
  events: EventName[];
  rangeStart?: string;
  rangeEnd?: string;
  limit?: number;
  after?: string;
  organizationId?: string;
  /**
   * As of 2026-06-11 the `GET /events` endpoint silently ignores this
   * parameter and always returns events oldest-first regardless of whether
   * `asc`, `desc`, or nothing is sent — see
   * {@link https://github.com/workos/workos-node/issues/1610}. The SDK
   * continues to serialize the value on the wire so callers automatically
   * pick up the server-side fix when it lands; until then, treat the
   * response as ascending-by-`created_at` and seed cursor pagination from
   * the oldest end of the stream.
   */
  order?: 'asc' | 'desc';
}

export interface SerializedListEventOptions {
  events: EventName[];
  range_start?: string;
  range_end?: string;
  limit?: number;
  after?: string;
  organization_id?: string;
  /**
   * Wire-layer mirror of {@link ListEventOptions.order}. The server-side bug
   * lives at this layer: as of 2026-06-11 `GET /events?order=desc` returns
   * events oldest-first regardless. See
   * {@link https://github.com/workos/workos-node/issues/1610}.
   */
  order?: 'asc' | 'desc';
}
