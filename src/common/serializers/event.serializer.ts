import {
  deserializeDeletedEventDirectory,
  deserializeDirectoryUser,
  deserializeEventDirectory,
  deserializeDirectoryGroup,
  deserializeUpdatedEventDirectoryGroup,
  deserializeUpdatedEventDirectoryUser,
} from '../../directory-sync/serializers';
import { deserializeConnection } from '../../sso/serializers';
import { deserializeUser } from '../../user-management/serializers';
import { deserializeOrganizationMembership } from '../../user-management/serializers/organization-membership.serializer';
import { deserializeSession } from '../../user-management/serializers/session.serializer';
import { Event, EventBase, EventResponse } from '../interfaces';

export const deserializeEvent = (event: EventResponse): Event => {
  const eventBase: EventBase = {
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
        data: deserializeEventDirectory(event.data),
      };
    case 'dsync.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeDeletedEventDirectory(event.data),
      };
    case 'dsync.group.created':
    case 'dsync.group.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeDirectoryGroup(event.data),
      };
    case 'dsync.group.updated':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeUpdatedEventDirectoryGroup(event.data),
      };
    case 'dsync.group.user_added':
    case 'dsync.group.user_removed':
      return {
        ...eventBase,
        event: event.event,
        data: {
          directoryId: event.data.directory_id,
          user: deserializeDirectoryUser(event.data.user),
          group: deserializeDirectoryGroup(event.data.group),
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
        data: deserializeUpdatedEventDirectoryUser(event.data),
      };
    case 'user.created':
    case 'user.updated':
    case 'user.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeUser(event.data),
      };
    case 'organization_membership.added':
    case 'organization_membership.updated':
    case 'organization_membership.removed':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeOrganizationMembership(event.data),
      };
    case 'session.created':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeSession(event.data),
      };
  }
};
