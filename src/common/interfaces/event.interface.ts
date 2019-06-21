export interface Event {
  group: string;
  actor_name: string;
  actor_id: string;
  location: string;
  occurred_at: Date;
  target_name: string;
  target_id: string;
  action: string;
  action_type: string;
  metadata?: {
    [key: string]: string;
  };
}
