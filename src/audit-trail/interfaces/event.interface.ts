export interface AuditTrailEventAction {
  object: 'event_action';
  id: string;
  name: string;
}

export interface AuditTrailEvent {
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
  occurred_at: Date;
  action: AuditTrailEventAction;
  metadata?: {
    [key: string]: string;
  };
}
