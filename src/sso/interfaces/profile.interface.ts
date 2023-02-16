import { ConnectionType } from './connection-type.enum';

export interface Profile {
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
