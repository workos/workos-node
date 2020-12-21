export interface EventAction {
  object: 'event_action';
  id: string;
  name: string;
  project_id: string;
}

export interface Event {
  object: 'event';
  id: string;
  group: string;
  location: string;
  latitude: string;
  longitude: string;
  type: string;
  actor_name: string;
  actor_id: string;
  target_name: string;
  target_id: string;
  environment_id: string;
  occurred_at: Date;
  action: EventAction;
  metadata?: {
    [key: string]: string;
  };
}
