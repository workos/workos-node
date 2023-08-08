import { CreateEventOptions } from './interfaces/create-event-options.interface';
import { AuditTrailEvent } from './interfaces/event.interface';
import { EventOptions } from './interfaces/event-options.interface';
import { ListResponse } from '../common/interfaces';
import { ListEventsOptions } from './interfaces/list-events-options.interface';
import { WorkOS } from '../workos';

export class AuditTrail {
  constructor(private readonly workos: WorkOS) {}

  async createEvent(
    event: EventOptions,
    { idempotencyKey }: CreateEventOptions = {},
  ) {
    await this.workos.post('/events', event, { idempotencyKey });
  }

  async listEvents(
    options?: ListEventsOptions,
  ): Promise<ListResponse<AuditTrailEvent>> {
    const { data } = await this.workos.get('/events', {
      query: options,
    });
    return data;
  }
}
