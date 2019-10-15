import { Event } from '../common/interfaces';
import WorkOS from '../workos';

export class Auditlog {
  constructor(private readonly workos: WorkOS) {}

  async create(event: Event) {
    await this.workos.post(event, '/events');
  }
}
