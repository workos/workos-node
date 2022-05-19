import { Connection } from '../../sso/interfaces';
import { WebhookDirectoryGroup as Group } from './webhook-directory-group.interface';
import { WebhookDirectoryUser as User } from './webhook-directory-user.interface';
import { WebhookDirectory as Directory } from './webhook-directory.interface';

interface WebhookBase {
  id: string;
}

export interface ConnectionActivatedWebhook extends WebhookBase {
  event: 'connection.activated';
  data: Connection;
}

export interface ConnectionDeactivatedWebhook extends WebhookBase {
  event: 'connection.deactivated';
  data: Connection;
}

export interface ConnectionDeletedWebhook extends WebhookBase {
  event: 'connection.deleted';
  data: Connection;
}

export interface DsyncActivatedWebhook extends WebhookBase {
  event: 'dsync.activated';
  data: Directory;
}

export interface DsyncDeactivatedWebhook extends WebhookBase {
  event: 'dsync.deactivated';
  data: Directory;
}

export interface DsyncDeletedWebhook extends WebhookBase {
  event: 'dsync.deleted';
  data: Omit<Directory, 'domains' | 'external_key'>;
}

export interface DsyncGroupCreatedWebhook extends WebhookBase {
  event: 'dsync.group.created';
  data: Group;
}

export interface DsyncGroupDeletedWebhook extends WebhookBase {
  event: 'dsync.group.deleted';
  data: Group;
}

export interface DsyncGroupUpdatedWebhook extends WebhookBase {
  event: 'dsync.group.updated';
  data: Group & Record<'previous_attributes', any>;
}

export interface DsyncGroupUserAddedWebhook extends WebhookBase {
  event: 'dsync.group.user_added';
  data: {
    directory_id: string;
    user: User;
    group: Pick<Group, 'id' | 'name'>;
  };
}

export interface DsyncGroupUserRemovedWebhook extends WebhookBase {
  event: 'dsync.group.user_removed';
  data: {
    directory_id: string;
    user: User;
    group: Pick<Group, 'id' | 'name'>;
  };
}

export interface DsyncUserCreatedWebhook extends WebhookBase {
  event: 'dsync.user.created';
  data: User;
}

export interface DsyncUserDeletedWebhook extends WebhookBase {
  event: 'dsync.user.deleted';
  data: User;
}

export interface DsyncUserUpdatedWebhook extends WebhookBase {
  event: 'dsync.user.updated';
  data: User & Record<'previous_attributes', any>;
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
