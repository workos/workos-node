import { Connection } from "../../sso/interfaces";
import { Directory, Group, User } from "../../directory-sync/interfaces";

type ConnectionActivatedWebhook = {
  event: "connection.activated";
  data: Connection;
};

type ConnectionDeactivatedWebhook = {
  event: "connection.deactivated";
  data: Connection;
};

type ConnectionDeletedWebhook = {
  event: "connection.deleted";
  data: Connection;
};

type DsyncActivatedWebhook = {
  event: "dsync.activated";
  data: Directory;
};

type DsyncDeactivatedWebhook = {
  event: "dsync.activated";
  data: Directory;
};

type DsyncDeletedWebhook = {
  event: "dsync.deleted";
  data: Directory;
};

type DsyncGroupCreatedWebhook = {
  event: "dsync.group.created";
  data: Group & {
    directory_id: string;
  };
};

type DsyncGroupDeletedWebhook = {
  event: "dsync.group.deleted";
  data: Group & {
    directory_id: string;
  };
};

type DsyncGroupUpdatedWebhook = {
  event: "dsync.group.updated";
  data: Group & {
    directory_id: string;
  };
};

type DsyncGroupUpdatedWebhook = {
  event: "dsync.group.user_added";
  data: {
    directory_id: string;
    user: User;
    group: Group;
  };
};

type DsyncGroupUserRemovedWebhook = {
  event: "dsync.group.user_removed";
  data: {
    directory_id: string;
    user: User;
    group: Group;
  };
};

type DsyncUserUpdatedWebhook = {
  event: "dsync.user.created";
  data: User;
};

type DsyncUserDeletedWebhook = {
  event: "dsync.user.deleted";
  data: User;
};

type DsyncUserDeletedWebhook = {
  event: "dsync.user.updated";
  data: User;
};

export type Webhook =
  | ConnectionActivatedWebhook
  | ConnectionDeactivatedWebhook
  | ConnectionDeletedWebhook
  | DsyncActivatedWebhook
  | DsyncDeactivatedWebhook
  | DsyncDeletedWebhook
  | DsyncGroupCreatedWebhook
  | DsyncGroupDeletedWebhook
  | DsyncGroupUpdatedWebhook
  | DsyncGroupUpdatedWebhook
  | DsyncGroupUserRemovedWebhook
  | DsyncUserUpdatedWebhook
  | DsyncUserDeletedWebhook
  | DsyncUserDeletedWebhook;
