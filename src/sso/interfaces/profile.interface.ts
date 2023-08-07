import { ConnectionType } from './connection-type.enum';

export interface Profile {
  id: string;
  idpId: string;
  organizationId?: string;
  connectionId: string;
  connectionType: ConnectionType;
  email: string;
  firstName?: string;
  lastName?: string;
  groups?: string[];
  rawAttributes?: { [key: string]: any };
}

export interface ProfileResponse {
  id: string;
  idp_id: string;
  organization_id?: string;
  connection_id: string;
  connection_type: ConnectionType;
  email: string;
  first_name?: string;
  last_name?: string;
  groups?: string[];
  raw_attributes?: { [key: string]: any };
}
