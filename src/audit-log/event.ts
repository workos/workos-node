// tslint:disable: variable-name

import { EventOptions, RestEntity } from '../common/interfaces';

export class Event implements RestEntity {
  readonly path: string = '/events';
  group: string;
  actor_name: string;
  actor_id: string;
  location: string;
  occurred_at: Date;
  target_name: string;
  target_id: string;
  action: string;
  action_type: string;
  metadata: any;

  constructor(event: EventOptions) {
    this.group = event.group;
    this.actor_name = event.actor_name;
    this.actor_id = event.actor_id;
    this.location = event.location;
    this.occurred_at = event.occurred_at;
    this.target_name = event.target_name;
    this.target_id = event.target_id;
    this.action = event.action;
    this.action_type = event.action_type;
    this.metadata = event.metadata;
  }
}
