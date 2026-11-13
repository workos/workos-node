import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
import { ConnectionType } from './connection-type.enum';

export interface ListConnectionsOptions extends PaginationOptions {
  /** Filter Connections by their type. */
  connectionType?: ConnectionType;
  /** Filter Connections by their associated domain. */
  domain?: string;
  /** Filter Connections by their associated organization. */
  organizationId?: string;
  /** Filter Connections by their state. */
  state?: 'active' | 'inactive' | 'validating';
}

export interface SerializedListConnectionsOptions extends PaginationOptions {
  connection_type?: ConnectionType;
  domain?: string;
  organization_id?: string;
  state?: 'active' | 'inactive' | 'validating';
}
