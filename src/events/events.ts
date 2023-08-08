import { WorkOS } from '../workos';
import { ListEventOptions } from './interfaces';
import { deserializeEvent, deserializeList } from '../common/serializers';
import { Event, EventResponse, List, ListResponse } from '../common/interfaces';

export class Events {
  constructor(private readonly workos: WorkOS) {}

  async listEvents(options: ListEventOptions): Promise<List<Event>> {
    const { data } = await this.workos.get<ListResponse<EventResponse>>(
      `/events`,
      {
        query: options,
      },
    );

    return deserializeList(data, deserializeEvent);
  }
}
