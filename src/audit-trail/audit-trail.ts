import { CreateEventOptions } from './interfaces/create-event-options.interface';
import { Event } from './interfaces/event.interface';
import { EventOptions } from './interfaces/event-options.interface';
import { List } from '../common/interfaces/list.interface';
import { ListEventsOptions } from './interfaces/list-events-options.interface';
import WorkOS from '../';

export class AuditTrail {
  constructor(private readonly workos: WorkOS) {}

  async createEvent(
    event: EventOptions,
    { idempotencyKey }: CreateEventOptions = {},
  ) {
    await this.workos.post('/events', event, { idempotencyKey });
  }

  async listEvents(options?: ListEventsOptions): Promise<List<Event>> {
    const { data } = await this.workos.get('/events', options);
    return data;
  }
}
