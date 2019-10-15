import { Event } from '../common/interfaces';
import WorkOS from '../workos';

export class AuditLog {
  constructor(private readonly workos: WorkOS) {}

  async createEvent(event: Event) {
    await this.workos.post(event, '/events');
  }
}
