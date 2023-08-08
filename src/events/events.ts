import { WorkOS } from '../workos';
import { Event, EventResponse } from './interfaces';
import { ListEventOptions } from './interfaces';
import { deserializeList } from '../common/serializers';
import { List, ListResponse } from '../common/interfaces';
import { deserializeEvent } from './serializers/event.serializer';

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
