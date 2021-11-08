import { Group, User } from '../../directory-sync/interfaces';
import { Connection } from '../../sso/interfaces';
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
  data: Directory;
}

export interface DsyncGroupCreatedWebhook extends WebhookBase {
  event: 'dsync.group.created';
  data: Group & {
    directory_id: string;
  };
}

export interface DsyncGroupDeletedWebhook extends WebhookBase {
  event: 'dsync.group.deleted';
  data: Group & {
    directory_id: string;
  };
}

export interface DsyncGroupUpdatedWebhook extends WebhookBase {
  event: 'dsync.group.updated';
  data: Group & {
    directory_id: string;
  };
}

export interface DsyncGroupUserAddedWebhook extends WebhookBase {
  event: 'dsync.group.user_added';
  data: {
    directory_id: string;
    user: User;
    group: Group;
  };
}

export interface DsyncGroupUserRemovedWebhook extends WebhookBase {
  event: 'dsync.group.user_removed';
  data: {
    directory_id: string;
    user: User;
    group: Group;
  };
}

export interface DsyncUserCreatedWebhook extends WebhookBase {
  event: 'dsync.user.created';
  data: User & {
    directory_id: string;
  };
}

export interface DsyncUserDeletedWebhook extends WebhookBase {
  event: 'dsync.user.deleted';
  data: User & {
    directory_id: string;
  };
}

export interface DsyncUserUpdatedWebhook extends WebhookBase {
  event: 'dsync.user.updated';
  data: User & {
    directory_id: string;
  };
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
