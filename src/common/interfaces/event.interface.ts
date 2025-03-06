import {
  DirectoryUser,
  DirectoryUserResponse,
  DirectoryGroup,
  DirectoryGroupResponse,
  EventDirectory,
  EventDirectoryResponse,
} from '../../directory-sync/interfaces';
import {
  Organization,
  OrganizationResponse,
} from '../../organizations/interfaces';
import { Connection, ConnectionResponse } from '../../sso/interfaces';
import {
  AuthenticationEvent,
  AuthenticationEventResponse,
  EmailVerificationEvent,
  EmailVerificationEventResponse,
  InvitationEvent,
  InvitationEventResponse,
  MagicAuthEvent,
  MagicAuthEventResponse,
  PasswordResetEvent,
  PasswordResetEventResponse,
  Session,
  SessionResponse,
  User,
  UserResponse,
} from '../../user-management/interfaces';
import {
  OrganizationMembership,
  OrganizationMembershipResponse,
} from '../../user-management/interfaces/organization-membership.interface';
import {
  RoleEvent,
  RoleEventResponse,
} from '../../roles/interfaces/role.interface';
import {
  OrganizationDomain,
  OrganizationDomainResponse,
} from '../../organization-domains/interfaces';
import {
  AuthenticationRadarRiskDetectedEventData,
  AuthenticationRadarRiskDetectedEventResponseData,
} from '../../user-management/interfaces/authentication-radar-risk-detected-event.interface';
import { ApiKey, SerializedApiKey } from '../../api-keys/interfaces';

export interface EventBase {
  id: string;
  createdAt: string;
  context: Record<string, unknown> | undefined;
}

interface EventResponseBase {
  id: string;
  created_at: string;
  context?: Record<string, unknown>;
}

export interface AuthenticationEmailVerificationSucceededEvent
  extends EventBase {
  event: 'authentication.email_verification_succeeded';
  data: AuthenticationEvent;
}

export interface AuthenticationEmailVerificationSucceededEventResponse
  extends EventResponseBase {
  event: 'authentication.email_verification_succeeded';
  data: AuthenticationEventResponse;
}

export interface AuthenticationMagicAuthFailedEvent extends EventBase {
  event: 'authentication.magic_auth_failed';
  data: AuthenticationEvent;
}

export interface AuthenticationMagicAuthFailedEventResponse
  extends EventResponseBase {
  event: 'authentication.magic_auth_failed';
  data: AuthenticationEventResponse;
}

export interface AuthenticationMagicAuthSucceededEvent extends EventBase {
  event: 'authentication.magic_auth_succeeded';
  data: AuthenticationEvent;
}

export interface AuthenticationMagicAuthSucceededEventResponse
  extends EventResponseBase {
  event: 'authentication.magic_auth_succeeded';
  data: AuthenticationEventResponse;
}

export interface AuthenticationMfaSucceededEvent extends EventBase {
  event: 'authentication.mfa_succeeded';
  data: AuthenticationEvent;
}

export interface AuthenticationMfaSucceededEventResponse
  extends EventResponseBase {
  event: 'authentication.mfa_succeeded';
  data: AuthenticationEventResponse;
}

export interface AuthenticationOAuthFailedEvent extends EventBase {
  event: 'authentication.oauth_failed';
  data: AuthenticationEvent;
}

export interface AuthenticationOAuthFailedEventResponse
  extends EventResponseBase {
  event: 'authentication.oauth_failed';
  data: AuthenticationEventResponse;
}

export interface AuthenticationOAuthSucceededEvent extends EventBase {
  event: 'authentication.oauth_succeeded';
  data: AuthenticationEvent;
}

export interface AuthenticationOAuthSucceededEventResponse
  extends EventResponseBase {
  event: 'authentication.oauth_succeeded';
  data: AuthenticationEventResponse;
}

export interface AuthenticationPasskeyFailedEvent extends EventBase {
  event: 'authentication.passkey_failed';
  data: AuthenticationEvent;
}

export interface AuthenticationPasskeyFailedEventResponse
  extends EventResponseBase {
  event: 'authentication.passkey_failed';
  data: AuthenticationEventResponse;
}

export interface AuthenticationPasskeySucceededEvent extends EventBase {
  event: 'authentication.passkey_succeeded';
  data: AuthenticationEvent;
}

export interface AuthenticationPasskeySucceededEventResponse
  extends EventResponseBase {
  event: 'authentication.passkey_succeeded';
  data: AuthenticationEventResponse;
}

export interface AuthenticationPasswordFailedEvent extends EventBase {
  event: 'authentication.password_failed';
  data: AuthenticationEvent;
}

export interface AuthenticationPasswordFailedEventResponse
  extends EventResponseBase {
  event: 'authentication.password_failed';
  data: AuthenticationEventResponse;
}

export interface AuthenticationPasswordSucceededEvent extends EventBase {
  event: 'authentication.password_succeeded';
  data: AuthenticationEvent;
}

export interface AuthenticationPasswordSucceededEventResponse
  extends EventResponseBase {
  event: 'authentication.password_succeeded';
  data: AuthenticationEventResponse;
}

export interface AuthenticationRadarRiskDetectedEvent extends EventBase {
  event: 'authentication.radar_risk_detected';
  data: AuthenticationRadarRiskDetectedEventData;
}

export interface AuthenticationRadarRiskDetectedEventResponse
  extends EventResponseBase {
  event: 'authentication.radar_risk_detected';
  data: AuthenticationRadarRiskDetectedEventResponseData;
}

export interface AuthenticationSSOFailedEvent extends EventBase {
  event: 'authentication.sso_failed';
  data: AuthenticationEvent;
}

export interface AuthenticationSSOFailedEventResponse
  extends EventResponseBase {
  event: 'authentication.sso_failed';
  data: AuthenticationEventResponse;
}

export interface AuthenticationSSOSucceededEvent extends EventBase {
  event: 'authentication.sso_succeeded';
  data: AuthenticationEvent;
}

export interface AuthenticationSSOSucceededEventResponse
  extends EventResponseBase {
  event: 'authentication.sso_succeeded';
  data: AuthenticationEventResponse;
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
  data: DirectoryGroup;
}

export interface DsyncGroupCreatedEventResponse extends EventResponseBase {
  event: 'dsync.group.created';
  data: DirectoryGroupResponse;
}

export interface DsyncGroupDeletedEvent extends EventBase {
  event: 'dsync.group.deleted';
  data: DirectoryGroup;
}

export interface DsyncGroupDeletedEventResponse extends EventResponseBase {
  event: 'dsync.group.deleted';
  data: DirectoryGroupResponse;
}

export interface DsyncGroupUpdatedEvent extends EventBase {
  event: 'dsync.group.updated';
  data: DirectoryGroup & Record<'previousAttributes', any>;
}

export interface DsyncGroupUpdatedEventResponse extends EventResponseBase {
  event: 'dsync.group.updated';
  data: DirectoryGroupResponse & Record<'previous_attributes', any>;
}

export interface DsyncGroupUserAddedEvent extends EventBase {
  event: 'dsync.group.user_added';
  data: {
    directoryId: string;
    user: DirectoryUser;
    group: DirectoryGroup;
  };
}

export interface DsyncGroupUserAddedEventResponse extends EventResponseBase {
  event: 'dsync.group.user_added';
  data: {
    directory_id: string;
    user: DirectoryUserResponse;
    group: DirectoryGroupResponse;
  };
}

export interface DsyncGroupUserRemovedEvent extends EventBase {
  event: 'dsync.group.user_removed';
  data: {
    directoryId: string;
    user: DirectoryUser;
    group: DirectoryGroup;
  };
}

export interface DsyncGroupUserRemovedEventResponse extends EventResponseBase {
  event: 'dsync.group.user_removed';
  data: {
    directory_id: string;
    user: DirectoryUserResponse;
    group: DirectoryGroupResponse;
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

export interface EmailVerificationCreatedEvent extends EventBase {
  event: 'email_verification.created';
  data: EmailVerificationEvent;
}

export interface EmailVerificationCreatedEventResponse
  extends EventResponseBase {
  event: 'email_verification.created';
  data: EmailVerificationEventResponse;
}

export interface InvitationAcceptedEvent extends EventBase {
  event: 'invitation.accepted';
  data: InvitationEvent;
}
export interface InvitationCreatedEvent extends EventBase {
  event: 'invitation.created';
  data: InvitationEvent;
}

export interface InvitationRevokedEvent extends EventBase {
  event: 'invitation.revoked';
  data: InvitationEvent;
}

export interface InvitationResentEvent extends EventBase {
  event: 'invitation.resent';
  data: InvitationEvent;
}

export interface InvitationAcceptedEventResponse extends EventResponseBase {
  event: 'invitation.accepted';
  data: InvitationEventResponse;
}

export interface InvitationCreatedEventResponse extends EventResponseBase {
  event: 'invitation.created';
  data: InvitationEventResponse;
}

export interface InvitationRevokedEventResponse extends EventResponseBase {
  event: 'invitation.revoked';
  data: InvitationEventResponse;
}

export interface InvitationResentEventResponse extends EventResponseBase {
  event: 'invitation.resent';
  data: InvitationEventResponse;
}

export interface MagicAuthCreatedEvent extends EventBase {
  event: 'magic_auth.created';
  data: MagicAuthEvent;
}

export interface MagicAuthCreatedEventResponse extends EventResponseBase {
  event: 'magic_auth.created';
  data: MagicAuthEventResponse;
}

export interface PasswordResetCreatedEvent extends EventBase {
  event: 'password_reset.created';
  data: PasswordResetEvent;
}

export interface PasswordResetCreatedEventResponse extends EventResponseBase {
  event: 'password_reset.created';
  data: PasswordResetEventResponse;
}

export interface PasswordResetSucceededEvent extends EventBase {
  event: 'password_reset.succeeded';
  data: PasswordResetEvent;
}

export interface PasswordResetSucceededEventResponse extends EventResponseBase {
  event: 'password_reset.succeeded';
  data: PasswordResetEventResponse;
}

export interface UserCreatedEvent extends EventBase {
  event: 'user.created';
  data: User;
}

export interface UserCreatedEventResponse extends EventResponseBase {
  event: 'user.created';
  data: UserResponse;
}

export interface UserUpdatedEvent extends EventBase {
  event: 'user.updated';
  data: User;
}

export interface UserUpdatedEventResponse extends EventResponseBase {
  event: 'user.updated';
  data: UserResponse;
}

export interface UserDeletedEvent extends EventBase {
  event: 'user.deleted';
  data: User;
}

export interface UserDeletedEventResponse extends EventResponseBase {
  event: 'user.deleted';
  data: UserResponse;
}

export interface OrganizationMembershipCreated extends EventBase {
  event: 'organization_membership.created';
  data: OrganizationMembership;
}

export interface OrganizationMembershipCreatedResponse
  extends EventResponseBase {
  event: 'organization_membership.created';
  data: OrganizationMembershipResponse;
}

export interface OrganizationMembershipDeleted extends EventBase {
  event: 'organization_membership.deleted';
  data: OrganizationMembership;
}

export interface OrganizationMembershipDeletedResponse
  extends EventResponseBase {
  event: 'organization_membership.deleted';
  data: OrganizationMembershipResponse;
}

export interface OrganizationMembershipUpdated extends EventBase {
  event: 'organization_membership.updated';
  data: OrganizationMembership;
}

export interface OrganizationMembershipUpdatedResponse
  extends EventResponseBase {
  event: 'organization_membership.updated';
  data: OrganizationMembershipResponse;
}

export interface OrganizationCreatedEvent extends EventBase {
  event: 'organization.created';
  data: Organization;
}

export interface OrganizationCreatedResponse extends EventResponseBase {
  event: 'organization.created';
  data: OrganizationResponse;
}

export interface OrganizationUpdatedEvent extends EventBase {
  event: 'organization.updated';
  data: Organization;
}

export interface OrganizationUpdatedResponse extends EventResponseBase {
  event: 'organization.updated';
  data: OrganizationResponse;
}

export interface OrganizationDeletedEvent extends EventBase {
  event: 'organization.deleted';
  data: Organization;
}

export interface OrganizationDeletedResponse extends EventResponseBase {
  event: 'organization.deleted';
  data: OrganizationResponse;
}

export interface RoleCreatedEvent extends EventBase {
  event: 'role.created';
  data: RoleEvent;
}

export interface RoleCreatedEventResponse extends EventResponseBase {
  event: 'role.created';
  data: RoleEventResponse;
}

export interface RoleDeletedEvent extends EventBase {
  event: 'role.deleted';
  data: RoleEvent;
}

export interface RoleDeletedEventResponse extends EventResponseBase {
  event: 'role.deleted';
  data: RoleEventResponse;
}

export interface RoleUpdatedEvent extends EventBase {
  event: 'role.updated';
  data: RoleEvent;
}

export interface RoleUpdatedEventResponse extends EventResponseBase {
  event: 'role.updated';
  data: RoleEventResponse;
}

export interface SessionCreatedEvent extends EventBase {
  event: 'session.created';
  data: Session;
}

export interface SessionCreatedEventResponse extends EventResponseBase {
  event: 'session.created';
  data: SessionResponse;
}

export interface SessionRevokedEvent extends EventBase {
  event: 'session.revoked';
  data: Session;
}

export interface SessionRevokedEventResponse extends EventResponseBase {
  event: 'session.revoked';
  data: SessionResponse;
}

export interface OrganizationDomainVerifiedEvent extends EventBase {
  event: 'organization_domain.verified';
  data: OrganizationDomain;
}

export interface OrganizationDomainVerifiedEventResponse
  extends EventResponseBase {
  event: 'organization_domain.verified';
  data: OrganizationDomainResponse;
}

export interface OrganizationDomainVerificationFailedEvent extends EventBase {
  event: 'organization_domain.verification_failed';
  data: OrganizationDomain;
}

export interface OrganizationDomainVerificationFailedEventResponse
  extends EventResponseBase {
  event: 'organization_domain.verification_failed';
  data: OrganizationDomainResponse;
}

export interface OrganizationDomainCreatedEvent extends EventBase {
  event: 'organization_domain.created';
  data: OrganizationDomain;
}

export interface OrganizationDomainCreatedEventResponse
  extends EventResponseBase {
  event: 'organization_domain.created';
  data: OrganizationDomainResponse;
}

export interface OrganizationDomainUpdatedEvent extends EventBase {
  event: 'organization_domain.updated';
  data: OrganizationDomain;
}

export interface OrganizationDomainUpdatedEventResponse
  extends EventResponseBase {
  event: 'organization_domain.updated';
  data: OrganizationDomainResponse;
}

export interface OrganizationDomainDeletedEvent extends EventBase {
  event: 'organization_domain.deleted';
  data: OrganizationDomain;
}

export interface OrganizationDomainDeletedEventResponse
  extends EventResponseBase {
  event: 'organization_domain.deleted';
  data: OrganizationDomainResponse;
}

export interface ApiKeyCreatedEvent extends EventBase {
  event: 'api_key.created';
  data: ApiKey;
}

export interface ApiKeyCreatedEventResponse extends EventResponseBase {
  event: 'api_key.created';
  data: SerializedApiKey;
}

export interface ApiKeyDeletedEvent extends EventBase {
  event: 'api_key.deleted';
  data: ApiKey;
}

export interface ApiKeyDeletedEventResponse extends EventResponseBase {
  event: 'api_key.deleted';
  data: SerializedApiKey;
}

export type Event =
  | AuthenticationEmailVerificationSucceededEvent
  | AuthenticationMfaSucceededEvent
  | AuthenticationOAuthFailedEvent
  | AuthenticationOAuthSucceededEvent
  | AuthenticationSSOFailedEvent
  | AuthenticationSSOSucceededEvent
  | AuthenticationPasskeyFailedEvent
  | AuthenticationPasskeySucceededEvent
  | AuthenticationPasswordFailedEvent
  | AuthenticationPasswordSucceededEvent
  | AuthenticationMagicAuthFailedEvent
  | AuthenticationMagicAuthSucceededEvent
  | AuthenticationRadarRiskDetectedEvent
  | ConnectionActivatedEvent
  | ConnectionDeactivatedEvent
  | ConnectionDeletedEvent
  | DsyncActivatedEvent
  | DsyncDeletedEvent
  | DsyncGroupCreatedEvent
  | DsyncGroupUpdatedEvent
  | DsyncGroupDeletedEvent
  | DsyncGroupUserAddedEvent
  | DsyncGroupUserRemovedEvent
  | DsyncUserCreatedEvent
  | DsyncUserUpdatedEvent
  | DsyncUserDeletedEvent
  | EmailVerificationCreatedEvent
  | InvitationAcceptedEvent
  | InvitationCreatedEvent
  | InvitationRevokedEvent
  | InvitationResentEvent
  | MagicAuthCreatedEvent
  | PasswordResetCreatedEvent
  | PasswordResetSucceededEvent
  | UserCreatedEvent
  | UserUpdatedEvent
  | UserDeletedEvent
  | OrganizationMembershipCreated
  | OrganizationMembershipDeleted
  | OrganizationMembershipUpdated
  | RoleCreatedEvent
  | RoleDeletedEvent
  | RoleUpdatedEvent
  | SessionCreatedEvent
  | SessionRevokedEvent
  | OrganizationCreatedEvent
  | OrganizationUpdatedEvent
  | OrganizationDeletedEvent
  | OrganizationDomainVerifiedEvent
  | OrganizationDomainVerificationFailedEvent
  | OrganizationDomainCreatedEvent
  | OrganizationDomainUpdatedEvent
  | OrganizationDomainDeletedEvent
  | ApiKeyCreatedEvent
  | ApiKeyDeletedEvent;

export type EventResponse =
  | AuthenticationEmailVerificationSucceededEventResponse
  | AuthenticationMagicAuthFailedEventResponse
  | AuthenticationMagicAuthSucceededEventResponse
  | AuthenticationMfaSucceededEventResponse
  | AuthenticationOAuthFailedEventResponse
  | AuthenticationOAuthSucceededEventResponse
  | AuthenticationPasskeyFailedEventResponse
  | AuthenticationPasskeySucceededEventResponse
  | AuthenticationPasswordFailedEventResponse
  | AuthenticationPasswordSucceededEventResponse
  | AuthenticationSSOFailedEventResponse
  | AuthenticationSSOSucceededEventResponse
  | AuthenticationRadarRiskDetectedEventResponse
  | ConnectionActivatedEventResponse
  | ConnectionDeactivatedEventResponse
  | ConnectionDeletedEventResponse
  | DsyncActivatedEventResponse
  | DsyncDeletedEventResponse
  | DsyncGroupCreatedEventResponse
  | DsyncGroupUpdatedEventResponse
  | DsyncGroupDeletedEventResponse
  | DsyncGroupUserAddedEventResponse
  | DsyncGroupUserRemovedEventResponse
  | DsyncUserCreatedEventResponse
  | DsyncUserUpdatedEventResponse
  | DsyncUserDeletedEventResponse
  | EmailVerificationCreatedEventResponse
  | InvitationAcceptedEventResponse
  | InvitationCreatedEventResponse
  | InvitationRevokedEventResponse
  | InvitationResentEventResponse
  | MagicAuthCreatedEventResponse
  | PasswordResetCreatedEventResponse
  | PasswordResetSucceededEventResponse
  | UserCreatedEventResponse
  | UserUpdatedEventResponse
  | UserDeletedEventResponse
  | OrganizationMembershipCreatedResponse
  | OrganizationMembershipDeletedResponse
  | OrganizationMembershipUpdatedResponse
  | RoleCreatedEventResponse
  | RoleDeletedEventResponse
  | RoleUpdatedEventResponse
  | SessionCreatedEventResponse
  | SessionRevokedEventResponse
  | OrganizationCreatedResponse
  | OrganizationUpdatedResponse
  | OrganizationDeletedResponse
  | OrganizationDomainVerifiedEventResponse
  | OrganizationDomainVerificationFailedEventResponse
  | OrganizationDomainCreatedEventResponse
  | OrganizationDomainUpdatedEventResponse
  | OrganizationDomainDeletedEventResponse
  | ApiKeyCreatedEventResponse
  | ApiKeyDeletedEventResponse;

export type EventName = Event['event'];
