import { CreateEventOptions } from './interfaces/create-event-options.interface';
import { Event } from '../common/interfaces';
import WorkOS from '../workos';

export class AuditTrail {
  constructor(private readonly workos: WorkOS) {}

  async createEvent(event: Event, { idempotencyKey }: CreateEventOptions = {}) {
    await this.workos.post('/events', event, { idempotencyKey });
  }
}
