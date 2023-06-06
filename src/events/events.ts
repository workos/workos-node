import { WorkOS } from '../workos';
import { Event } from './interfaces/event.interface';
import { List } from '../common/interfaces/list.interface';
import { ListEventOptions } from './interfaces';

export class Events {
  constructor(private readonly workos: WorkOS) {}

  async listEvents(options: ListEventOptions): Promise<List<Event>> {
    const { data } = await this.workos.get(`/events`, {
      query: options,
    });
    return data;
  }
}
