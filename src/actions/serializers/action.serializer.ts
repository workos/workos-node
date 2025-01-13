import { deserializeOrganization } from '../../organizations/serializers/organization.serializer';
import {
  deserializeInvitation,
  deserializeUser,
} from '../../user-management/serializers';
import { deserializeOrganizationMembership } from '../../user-management/serializers/organization-membership.serializer';
import {
  ActionContext,
  ActionPayload,
  UserData,
  UserDataPayload,
} from '../interfaces/action.interface';

const deserializeUserData = (userData: UserDataPayload): UserData => {
  return {
    object: userData.object,
    email: userData.email,
    firstName: userData.first_name,
    lastName: userData.last_name,
  };
};

export const deserializeAction = (
  actionPayload: ActionPayload,
): ActionContext => {
  switch (actionPayload.object) {
    case 'user_registration_action_context':
      return {
        id: actionPayload.id,
        object: actionPayload.object,
        userData: deserializeUserData(actionPayload.user_data),
        invitation: actionPayload.invitation
          ? deserializeInvitation(actionPayload.invitation)
          : undefined,

        ipAddress: actionPayload.ip_address,
        userAgent: actionPayload.user_agent,
        deviceFingerprint: actionPayload.device_fingerprint,
      };
    case 'authentication_action_context':
      return {
        id: actionPayload.id,
        object: actionPayload.object,
        user: deserializeUser(actionPayload.user),
        organization: actionPayload.organization
          ? deserializeOrganization(actionPayload.organization)
          : undefined,
        organizationMembership: actionPayload.organization_membership
          ? deserializeOrganizationMembership(
              actionPayload.organization_membership,
            )
          : undefined,
        ipAddress: actionPayload.ip_address,
        userAgent: actionPayload.user_agent,
        deviceFingerprint: actionPayload.device_fingerprint,
        issuer: actionPayload.issuer,
      };
  }
};
