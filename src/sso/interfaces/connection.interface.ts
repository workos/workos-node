import { ConnectionType } from './connection-type.enum';

export interface ConnectionDomain {
  object: 'connection_domain';
  id: string;
  domain: string;
}

export interface Connection {
  object: 'connection';
  id: string;
  organization_id: string;
  name: string;
  connection_type: ConnectionType;
  state: 'draft' | 'active' | 'inactive';
  /**
   * @deprecated The status parameter has been deprecated. Please use state.
   */
  status: 'linked' | 'unlinked';
  domains: ConnectionDomain[];
}
