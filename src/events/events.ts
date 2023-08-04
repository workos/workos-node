import { WorkOS } from '../workos';
import { Event, EventResponse } from './interfaces';
import { ListEventOptions } from './interfaces';
import { deserializeList } from '../common/serializers';
import { DeserializedList, List } from '../common/interfaces';
import { deserializeEvent } from './serializers/event.serializer';

export class Events {
  constructor(private readonly workos: WorkOS) {}

  async listEvents(
    options: ListEventOptions,
  ): Promise<DeserializedList<Event>> {
    const { data } = await this.workos.get<List<EventResponse>>(`/events`, {
      query: options,
    });

    return deserializeList(data, deserializeEvent);
  }
}
