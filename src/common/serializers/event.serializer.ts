import { deserializeDirectoryUser } from '../../directory-sync/serializers';
import { deserializeConnection } from '../../sso/serializers';
import {
  Webhook,
  WebhookBase,
  WebhookResponse,
} from '../../webhooks/interfaces';
import {
  deserializeDeletedWebhookDirectory,
  deserializeUpdatedWebhookDirectoryGroup,
  deserializeUpdatedWebhookDirectoryUser,
  deserializeWebhookDirectory,
  deserializeWebhookDirectoryGroup,
} from '../../webhooks/serializers';

export const deserializeEvent = (event: WebhookResponse): Webhook => {
  const eventBase: WebhookBase = {
    id: event.id,
    createdAt: event.created_at,
  };

  switch (event.event) {
    case 'connection.activated':
    case 'connection.deactivated':
    case 'connection.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeConnection(event.data),
      };
    case 'dsync.activated':
    case 'dsync.deactivated':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeWebhookDirectory(event.data),
      };
    case 'dsync.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeDeletedWebhookDirectory(event.data),
      };
    case 'dsync.group.created':
    case 'dsync.group.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeWebhookDirectoryGroup(event.data),
      };
    case 'dsync.group.updated':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeUpdatedWebhookDirectoryGroup(event.data),
      };
    case 'dsync.group.user_added':
    case 'dsync.group.user_removed':
      return {
        ...eventBase,
        event: event.event,
        data: {
          directoryId: event.data.directory_id,
          user: deserializeDirectoryUser(event.data.user),
          group: event.data.group,
        },
      };
    case 'dsync.user.created':
    case 'dsync.user.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeDirectoryUser(event.data),
      };
    case 'dsync.user.updated':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeUpdatedWebhookDirectoryUser(event.data),
      };
  }
};
