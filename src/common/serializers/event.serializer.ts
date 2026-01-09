import {
  deserializeDeletedEventDirectory,
  deserializeDirectoryUser,
  deserializeEventDirectory,
  deserializeDirectoryGroup,
  deserializeUpdatedEventDirectoryGroup,
  deserializeUpdatedEventDirectoryUser,
} from '../../directory-sync/serializers';
import { deserializeOrganization } from '../../organizations/serializers';
import { deserializeConnection } from '../../sso/serializers';
import {
  deserializeAuthenticationEvent,
  deserializeEmailVerificationEvent,
  deserializeInvitationEvent,
  deserializeMagicAuthEvent,
  deserializePasswordResetEvent,
  deserializeUser,
} from '../../user-management/serializers';
import { deserializeOrganizationDomain } from '../../organization-domains/serializers/organization-domain.serializer';
import { deserializeOrganizationMembership } from '../../user-management/serializers/organization-membership.serializer';
import { deserializeRoleEvent } from '../../user-management/serializers/role.serializer';
import { deserializeSession } from '../../user-management/serializers/session.serializer';
import { Event, EventBase, EventResponse } from '../interfaces';
import { deserializeAuthenticationRadarRiskDetectedEvent } from '../../user-management/serializers/authentication-radar-risk-event-serializer';
import { deserializeApiKey } from '../../api-keys/serializers/api-key.serializer';

export const deserializeEvent = (event: EventResponse): Event => {
  const eventBase: EventBase = {
    id: event.id,
    createdAt: event.created_at,
    context: event.context,
  };

  switch (event.event) {
    case 'authentication.email_verification_succeeded':
    case 'authentication.magic_auth_failed':
    case 'authentication.magic_auth_succeeded':
    case 'authentication.mfa_succeeded':
    case 'authentication.oauth_failed':
    case 'authentication.oauth_succeeded':
    case 'authentication.passkey_failed':
    case 'authentication.passkey_succeeded':
    case 'authentication.password_failed':
    case 'authentication.password_succeeded':
    case 'authentication.sso_failed':
    case 'authentication.sso_succeeded':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeAuthenticationEvent(event.data),
      };
    case 'authentication.radar_risk_detected':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeAuthenticationRadarRiskDetectedEvent(event.data),
      };
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
    case 'email_verification.created':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeEmailVerificationEvent(event.data),
      };
    case 'invitation.accepted':
    case 'invitation.created':
    case 'invitation.revoked':
    case 'invitation.resent':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeInvitationEvent(event.data),
      };
    case 'magic_auth.created':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeMagicAuthEvent(event.data),
      };
    case 'password_reset.created':
    case 'password_reset.succeeded':
      return {
        ...eventBase,
        event: event.event,
        data: deserializePasswordResetEvent(event.data),
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
    case 'organization_membership.created':
    case 'organization_membership.deleted':
    case 'organization_membership.updated':
    case 'organization_membership.removed':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeOrganizationMembership(event.data),
      };
    case 'role.created':
    case 'role.deleted':
    case 'role.updated':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeRoleEvent(event.data),
      };
    case 'session.created':
    case 'session.revoked':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeSession(event.data),
      };
    case 'organization.created':
    case 'organization.updated':
    case 'organization.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeOrganization(event.data),
      };
    case 'organization_domain.verified':
    case 'organization_domain.verification_failed':
    case 'organization_domain.created':
    case 'organization_domain.updated':
    case 'organization_domain.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeOrganizationDomain(event.data),
      };
    case 'api_key.created':
    case 'api_key.deleted':
      return {
        ...eventBase,
        event: event.event,
        data: deserializeApiKey(event.data),
      };
  }
};
