import {
  DirectoryUser,
  DirectoryUserResponse,
  EventDirectory,
  EventDirectoryGroup,
  EventDirectoryGroupResponse,
  EventDirectoryResponse,
} from '../../directory-sync/interfaces';
import { Connection, ConnectionResponse } from '../../sso/interfaces';

export interface EventBase {
  id: string;
  createdAt: string;
}

interface EventResponseBase {
  id: string;
  created_at: string;
}

export interface ConnectionActivatedEvent extends EventBase {
  event: 'connection.activated';
  data: Connection;
}

export interface ConnectionActivatedEventResponse extends EventResponseBase {
  event: 'connection.activated';
  data: ConnectionResponse;
}

export interface ConnectionDeactivatedEvent extends EventBase {
  event: 'connection.deactivated';
  data: Connection;
}

export interface ConnectionDeactivatedEventResponse extends EventResponseBase {
  event: 'connection.deactivated';
  data: ConnectionResponse;
}

export interface ConnectionDeletedEvent extends EventBase {
  event: 'connection.deleted';
  data: Connection;
}

export interface ConnectionDeletedEventResponse extends EventResponseBase {
  event: 'connection.deleted';
  data: ConnectionResponse;
}

export interface DsyncActivatedEvent extends EventBase {
  event: 'dsync.activated';
  data: EventDirectory;
}

export interface DsyncActivatedEventResponse extends EventResponseBase {
  event: 'dsync.activated';
  data: EventDirectoryResponse;
}

export interface DsyncDeactivatedEvent extends EventBase {
  event: 'dsync.deactivated';
  data: EventDirectory;
}

export interface DsyncDeactivatedEventResponse extends EventResponseBase {
  event: 'dsync.deactivated';
  data: EventDirectoryResponse;
}

export interface DsyncDeletedEvent extends EventBase {
  event: 'dsync.deleted';
  data: Omit<EventDirectory, 'domains' | 'externalKey'>;
}

export interface DsyncDeletedEventResponse extends EventResponseBase {
  event: 'dsync.deleted';
  data: Omit<EventDirectoryResponse, 'domains' | 'external_key'>;
}

export interface DsyncGroupCreatedEvent extends EventBase {
  event: 'dsync.group.created';
  data: EventDirectoryGroup;
}

export interface DsyncGroupCreatedEventResponse extends EventResponseBase {
  event: 'dsync.group.created';
  data: EventDirectoryGroupResponse;
}

export interface DsyncGroupDeletedEvent extends EventBase {
  event: 'dsync.group.deleted';
  data: EventDirectoryGroup;
}

export interface DsyncGroupDeletedEventResponse extends EventResponseBase {
  event: 'dsync.group.deleted';
  data: EventDirectoryGroupResponse;
}

export interface DsyncGroupUpdatedEvent extends EventBase {
  event: 'dsync.group.updated';
  data: EventDirectoryGroup & Record<'previousAttributes', any>;
}

export interface DsyncGroupUpdatedEventResponse extends EventResponseBase {
  event: 'dsync.group.updated';
  data: EventDirectoryGroupResponse & Record<'previous_attributes', any>;
}

export interface DsyncGroupUserAddedEvent extends EventBase {
  event: 'dsync.group.user_added';
  data: {
    directoryId: string;
    user: DirectoryUser;
    group: EventDirectoryGroupResponse;
  };
}

export interface DsyncGroupUserAddedEventResponse extends EventResponseBase {
  event: 'dsync.group.user_added';
  data: {
    directory_id: string;
    user: DirectoryUserResponse;
    group: EventDirectoryGroupResponse;
  };
}

export interface DsyncGroupUserRemovedEvent extends EventBase {
  event: 'dsync.group.user_removed';
  data: {
    directoryId: string;
    user: DirectoryUser;
    group: EventDirectoryGroupResponse;
  };
}

export interface DsyncGroupUserRemovedEventResponse extends EventResponseBase {
  event: 'dsync.group.user_removed';
  data: {
    directory_id: string;
    user: DirectoryUserResponse;
    group: EventDirectoryGroupResponse;
  };
}

export interface DsyncUserCreatedEvent extends EventBase {
  event: 'dsync.user.created';
  data: DirectoryUser;
}

export interface DsyncUserCreatedEventResponse extends EventResponseBase {
  event: 'dsync.user.created';
  data: DirectoryUserResponse;
}

export interface DsyncUserDeletedEvent extends EventBase {
  event: 'dsync.user.deleted';
  data: DirectoryUser;
}

export interface DsyncUserDeletedEventResponse extends EventResponseBase {
  event: 'dsync.user.deleted';
  data: DirectoryUserResponse;
}

export interface DsyncUserUpdatedEvent extends EventBase {
  event: 'dsync.user.updated';
  data: DirectoryUser & Record<'previousAttributes', any>;
}

export interface DsyncUserUpdatedEventResponse extends EventResponseBase {
  event: 'dsync.user.updated';
  data: DirectoryUserResponse & Record<'previous_attributes', any>;
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

export type EventResponse =
  | ConnectionActivatedEventResponse
  | ConnectionDeactivatedEventResponse
  | ConnectionDeletedEventResponse
  | DsyncActivatedEventResponse
  | DsyncDeactivatedEventResponse
  | DsyncDeletedEventResponse
  | DsyncGroupCreatedEventResponse
  | DsyncGroupUpdatedEventResponse
  | DsyncGroupDeletedEventResponse
  | DsyncGroupUserAddedEventResponse
  | DsyncGroupUserRemovedEventResponse
  | DsyncUserCreatedEventResponse
  | DsyncUserUpdatedEventResponse
  | DsyncUserDeletedEventResponse;

export type EventName =
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
