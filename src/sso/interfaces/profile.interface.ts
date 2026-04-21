import { UnknownRecord } from '../../common/interfaces/unknown-record.interface';
import { RoleResponse } from '../../roles/interfaces';
import { ConnectionType } from './connection-type.enum';

export interface Profile<CustomAttributesType extends UnknownRecord> {
  /** Unique identifier of the profile. */
  id: string;
  /** The user's unique identifier from the identity provider. */
  idpId: string;
  /** The ID of the organization the user belongs to. */
  organizationId?: string;
  /** The ID of the SSO connection used for authentication. */
  connectionId: string;
  /** The type of SSO connection. */
  connectionType: ConnectionType;
  /** The user's email address. */
  email: string;
  /** The user's first name. */
  firstName?: string;
  /** The user's last name. */
  lastName?: string;
  /** The role assigned to the user within the organization, if applicable. */
  role?: RoleResponse;
  /** The roles assigned to the user within the organization, if applicable. */
  roles?: RoleResponse[];
  /** The groups the user belongs to, as returned by the identity provider. */
  groups?: string[];
  /** Custom attribute mappings defined for the connection, returned as key-value pairs. */
  customAttributes?: CustomAttributesType;
  /** The complete set of raw attributes returned by the identity provider. */
  rawAttributes?: { [key: string]: any };
}

export interface ProfileResponse<CustomAttributesType extends UnknownRecord> {
  id: string;
  idp_id: string;
  organization_id?: string;
  connection_id: string;
  connection_type: ConnectionType;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: RoleResponse;
  roles?: RoleResponse[];
  groups?: string[];
  custom_attributes?: CustomAttributesType;
  raw_attributes?: { [key: string]: any };
}
