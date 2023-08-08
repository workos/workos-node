import {
  DirectoryUser,
  DirectoryUserResponse,
} from '../../directory-sync/interfaces';
import { Connection, ConnectionResponse } from '../../sso/interfaces';
import {
  WebhookDirectoryGroup as Group,
  WebhookDirectoryGroupResponse as GroupResponse,
} from './webhook-directory-group.interface';
import {
  WebhookDirectory as Directory,
  WebhookDirectoryResponse as DirectoryResponse,
} from './webhook-directory.interface';

export interface WebhookBase {
  id: string;
  createdAt: string;
}

interface WebhookResponseBase {
  id: string;
  created_at: string;
}

export interface ConnectionActivatedWebhook extends WebhookBase {
  event: 'connection.activated';
  data: Connection;
}

export interface ConnectionActivatedWebhookResponse
  extends WebhookResponseBase {
  event: 'connection.activated';
  data: ConnectionResponse;
}

export interface ConnectionDeactivatedWebhook extends WebhookBase {
  event: 'connection.deactivated';
  data: Connection;
}

export interface ConnectionDeactivatedWebhookResponse
  extends WebhookResponseBase {
  event: 'connection.deactivated';
  data: ConnectionResponse;
}

export interface ConnectionDeletedWebhook extends WebhookBase {
  event: 'connection.deleted';
  data: Connection;
}

export interface ConnectionDeletedWebhookResponse extends WebhookResponseBase {
  event: 'connection.deleted';
  data: ConnectionResponse;
}

export interface DsyncActivatedWebhook extends WebhookBase {
  event: 'dsync.activated';
  data: Directory;
}

export interface DsyncActivatedWebhookResponse extends WebhookResponseBase {
  event: 'dsync.activated';
  data: DirectoryResponse;
}

export interface DsyncDeactivatedWebhook extends WebhookBase {
  event: 'dsync.deactivated';
  data: Directory;
}

export interface DsyncDeactivatedWebhookResponse extends WebhookResponseBase {
  event: 'dsync.deactivated';
  data: DirectoryResponse;
}

export interface DsyncDeletedWebhook extends WebhookBase {
  event: 'dsync.deleted';
  data: Omit<Directory, 'domains' | 'externalKey'>;
}

export interface DsyncDeletedWebhookResponse extends WebhookResponseBase {
  event: 'dsync.deleted';
  data: Omit<DirectoryResponse, 'domains' | 'external_key'>;
}

export interface DsyncGroupCreatedWebhook extends WebhookBase {
  event: 'dsync.group.created';
  data: Group;
}

export interface DsyncGroupCreatedWebhookResponse extends WebhookResponseBase {
  event: 'dsync.group.created';
  data: GroupResponse;
}

export interface DsyncGroupDeletedWebhook extends WebhookBase {
  event: 'dsync.group.deleted';
  data: Group;
}

export interface DsyncGroupDeletedWebhookResponse extends WebhookResponseBase {
  event: 'dsync.group.deleted';
  data: GroupResponse;
}

export interface DsyncGroupUpdatedWebhook extends WebhookBase {
  event: 'dsync.group.updated';
  data: Group & Record<'previousAttributes', any>;
}

export interface DsyncGroupUpdatedWebhookResponse extends WebhookResponseBase {
  event: 'dsync.group.updated';
  data: GroupResponse & Record<'previous_attributes', any>;
}

export interface DsyncGroupUserAddedWebhook extends WebhookBase {
  event: 'dsync.group.user_added';
  data: {
    directoryId: string;
    user: DirectoryUser;
    group: Pick<Group, 'id' | 'name'>;
  };
}

export interface DsyncGroupUserAddedWebhookResponse
  extends WebhookResponseBase {
  event: 'dsync.group.user_added';
  data: {
    directory_id: string;
    user: DirectoryUserResponse;
    group: Pick<GroupResponse, 'id' | 'name'>;
  };
}

export interface DsyncGroupUserRemovedWebhook extends WebhookBase {
  event: 'dsync.group.user_removed';
  data: {
    directoryId: string;
    user: DirectoryUser;
    group: Pick<Group, 'id' | 'name'>;
  };
}

export interface DsyncGroupUserRemovedWebhookResponse
  extends WebhookResponseBase {
  event: 'dsync.group.user_removed';
  data: {
    directory_id: string;
    user: DirectoryUserResponse;
    group: Pick<GroupResponse, 'id' | 'name'>;
  };
}

export interface DsyncUserCreatedWebhook extends WebhookBase {
  event: 'dsync.user.created';
  data: DirectoryUser;
}

export interface DsyncUserCreatedWebhookResponse extends WebhookResponseBase {
  event: 'dsync.user.created';
  data: DirectoryUserResponse;
}

export interface DsyncUserDeletedWebhook extends WebhookBase {
  event: 'dsync.user.deleted';
  data: DirectoryUser;
}

export interface DsyncUserDeletedWebhookResponse extends WebhookResponseBase {
  event: 'dsync.user.deleted';
  data: DirectoryUserResponse;
}

export interface DsyncUserUpdatedWebhook extends WebhookBase {
  event: 'dsync.user.updated';
  data: DirectoryUser & Record<'previousAttributes', any>;
}

export interface DsyncUserUpdatedWebhookResponse extends WebhookResponseBase {
  event: 'dsync.user.updated';
  data: DirectoryUserResponse & Record<'previous_attributes', any>;
}

export type Webhook =
  | ConnectionActivatedWebhook
  | ConnectionDeactivatedWebhook
  | ConnectionDeletedWebhook
  | DsyncActivatedWebhook
  | DsyncDeactivatedWebhook
  | DsyncDeletedWebhook
  | DsyncGroupCreatedWebhook
  | DsyncGroupUpdatedWebhook
  | DsyncGroupDeletedWebhook
  | DsyncGroupUserAddedWebhook
  | DsyncGroupUserRemovedWebhook
  | DsyncUserCreatedWebhook
  | DsyncUserUpdatedWebhook
  | DsyncUserDeletedWebhook;

export type WebhookResponse =
  | ConnectionActivatedWebhookResponse
  | ConnectionDeactivatedWebhookResponse
  | ConnectionDeletedWebhookResponse
  | DsyncActivatedWebhookResponse
  | DsyncDeactivatedWebhookResponse
  | DsyncDeletedWebhookResponse
  | DsyncGroupCreatedWebhookResponse
  | DsyncGroupUpdatedWebhookResponse
  | DsyncGroupDeletedWebhookResponse
  | DsyncGroupUserAddedWebhookResponse
  | DsyncGroupUserRemovedWebhookResponse
  | DsyncUserCreatedWebhookResponse
  | DsyncUserUpdatedWebhookResponse
  | DsyncUserDeletedWebhookResponse;
