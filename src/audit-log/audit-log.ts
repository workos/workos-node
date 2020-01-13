import { CreateEventOptions } from './interfaces/create-event-options.interface';
import { Event } from '../common/interfaces';
import WorkOS from '../workos';

export class AuditLog {
  constructor(private readonly workos: WorkOS) {}

  async createEvent(event: Event, { idempotencyKey }: CreateEventOptions = {}) {
    const headers: any = {};

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    await this.workos.post('/events', event, { headers });
  }
}
