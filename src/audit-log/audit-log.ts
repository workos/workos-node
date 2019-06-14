import { Event } from './event';
import { WorkOS } from '../workos';

export class AuditLog {
  private readonly api: WorkOS;

  constructor(api: WorkOS) {
    this.api = api;
  }

  async publish(event: Event) {
    await this.api.post(event);
  }
}
