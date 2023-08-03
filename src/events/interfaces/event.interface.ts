interface EventBase {
  id: string;
  createdAt: string;
}

export interface ConnectionActivatedEvent extends EventBase {
  event: 'connection.activated';
  data: Record<string, unknown>;
}

export interface ConnectionDeactivatedEvent extends EventBase {
  event: 'connection.deactivated';
  data: Record<string, unknown>;
}

export interface ConnectionDeletedEvent extends EventBase {
  event: 'connection.deleted';
  data: Record<string, unknown>;
}

export interface DsyncActivatedEvent extends EventBase {
  event: 'dsync.activated';
  data: Record<string, unknown>;
}

export interface DsyncDeactivatedEvent extends EventBase {
  event: 'dsync.deactivated';
  data: Record<string, unknown>;
}

export interface DsyncDeletedEvent extends EventBase {
  event: 'dsync.deleted';
  data: Record<string, unknown>;
}

export interface DsyncGroupCreatedEvent extends EventBase {
  event: 'dsync.group.created';
  data: Record<string, unknown>;
}

export interface DsyncGroupDeletedEvent extends EventBase {
  event: 'dsync.group.deleted';
  data: Record<string, unknown>;
}

export interface DsyncGroupUpdatedEvent extends EventBase {
  event: 'dsync.group.updated';
  data: Record<string, unknown>;
}

export interface DsyncGroupUserAddedEvent extends EventBase {
  event: 'dsync.group.user_added';
  data: Record<string, unknown>;
}

export interface DsyncGroupUserRemovedEvent extends EventBase {
  event: 'dsync.group.user_removed';
  data: Record<string, unknown>;
}

export interface DsyncUserCreatedEvent extends EventBase {
  event: 'dsync.user.created';
  data: Record<string, unknown>;
}

export interface DsyncUserDeletedEvent extends EventBase {
  event: 'dsync.user.deleted';
  data: Record<string, unknown>;
}

export interface DsyncUserUpdatedEvent extends EventBase {
  event: 'dsync.user.updated';
  data: Record<string, unknown>;
}

export type Event =
  | ConnectionActivatedEvent
  | ConnectionDeactivatedEvent
  | ConnectionDeletedEvent
  | DsyncActivatedEvent
  | DsyncDeactivatedEvent
  | DsyncDeletedEvent
  | DsyncGroupCreatedEvent
  | DsyncGroupUpdatedEvent
  | DsyncGroupDeletedEvent
  | DsyncGroupUserAddedEvent
  | DsyncGroupUserRemovedEvent
  | DsyncUserCreatedEvent
  | DsyncUserUpdatedEvent
  | DsyncUserDeletedEvent;

export type EventResponse = Omit<Event, 'createdAt'> & { created_at: string };

export type EventNames =
  | 'connection.activated'
  | 'connection.deactivated'
  | 'connection.deleted'
  | 'dsync.activated'
  | 'dsync.deactivated'
  | 'dsync.deleted'
  | 'dsync.group.created'
  | 'dsync.group.deleted'
  | 'dsync.group.updated'
  | 'dsync.group.user_added'
  | 'dsync.group.user_removed'
  | 'dsync.user.created'
  | 'dsync.user.deleted'
  | 'dsync.user.updated';
