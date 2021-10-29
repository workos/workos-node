import { Connection } from '../../sso/interfaces';
import { Directory, Group, User } from '../../directory-sync/interfaces';

interface ConnectionActivatedWebhook {
  id: string;
  event: 'connection.activated';
  data: Connection;
}

interface ConnectionDeactivatedWebhook {
  id: string;
  event: 'connection.deactivated';
  data: Connection;
}

interface ConnectionDeletedWebhook {
  id: string;
  event: 'connection.deleted';
  data: Connection;
}

interface DsyncActivatedWebhook {
  id: string;
  event: 'dsync.activated';
  data: Directory;
}

interface DsyncDeactivatedWebhook {
  id: string;
  event: 'dsync.deactivated';
  data: Directory;
}

interface DsyncDeletedWebhook {
  id: string;
  event: 'dsync.deleted';
  data: Directory;
}

interface DsyncGroupCreatedWebhook {
  id: string;
  event: 'dsync.group.created';
  data: Group & {
    directory_id: string;
  };
}

interface DsyncGroupDeletedWebhook {
  id: string;
  event: 'dsync.group.deleted';
  data: Group & {
    directory_id: string;
  };
}

interface DsyncGroupUpdatedWebhook {
  id: string;
  event: 'dsync.group.updated';
  data: Group & {
    directory_id: string;
  };
}

interface DsyncGroupUserAddedWebhook {
  id: string;
  event: 'dsync.group.user_added';
  data: {
    directory_id: string;
    user: User;
    group: Group;
  };
}

interface DsyncGroupUserRemovedWebhook {
  id: string;
  event: 'dsync.group.user_removed';
  data: {
    directory_id: string;
    user: User;
    group: Group;
  };
}

interface DsyncUserUpdatedWebhook {
  id: string;
  event: 'dsync.user.created';
  data: User;
}

interface DsyncUserDeletedWebhook {
  id: string;
  event: 'dsync.user.deleted';
  data: User;
}

interface DsyncUserUpdatedWebhook {
  id: string;
  event: 'dsync.user.updated';
  data: User;
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
