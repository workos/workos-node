import { ConnectionType } from './connection-type.enum';

export interface ConnectionDomain {
  object: 'connection_domain';
  id: string;
  domain: string;
}

export interface Connection {
  /** Distinguishes the Connection object. */
  object: 'connection';
  /** Unique identifier for the Connection. */
  id: string;
  /** Unique identifier for the Organization in which the Connection resides. */
  organizationId?: string;
  /** A human-readable name for the Connection. This will most commonly be the organization's name. */
  name: string;
  /** Indicates whether a Connection is able to authenticate users. */
  state: 'draft' | 'active' | 'inactive' | 'validating';
  /** List of Organization Domains. */
  domains: ConnectionDomain[];
  type: ConnectionType;
  /** An ISO 8601 timestamp. */
  createdAt: string;
  /** An ISO 8601 timestamp. */
  updatedAt: string;
}

export interface ConnectionResponse {
  object: 'connection';
  id: string;
  organization_id?: string;
  name: string;
  connection_type: ConnectionType;
  state: 'draft' | 'active' | 'inactive' | 'validating';
  domains: ConnectionDomain[];
  created_at: string;
  updated_at: string;
}
