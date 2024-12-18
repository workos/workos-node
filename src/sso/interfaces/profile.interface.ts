import { RoleResponse } from '../../roles/interfaces';
import { ConnectionType } from './connection-type.enum';

export interface Profile<TRole extends string = string>  {
  id: string;
  idpId: string;
  organizationId?: string;
  connectionId: string;
  connectionType: ConnectionType;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: RoleResponse<TRole>;
  groups?: string[];
  rawAttributes?: { [key: string]: any };
}

export interface ProfileResponse<TRole extends string = string> {
  id: string;
  idp_id: string;
  organization_id?: string;
  connection_id: string;
  connection_type: ConnectionType;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: RoleResponse<TRole>;
  groups?: string[];
  raw_attributes?: { [key: string]: any };
}
