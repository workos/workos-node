import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
import { ConnectionType } from './connection-type.interface';

export interface ListConnectionsOptions extends PaginationOptions {
  /** Filter Connections by their type. */
  connectionType?: ConnectionType;
  /** Filter Connections by their associated domain. */
  domain?: string;
  /** Filter Connections by their associated organization. */
  organizationId?: string;
  /** Filter Connections by a search term. */
  search?: string;
}

export interface SerializedListConnectionsOptions extends PaginationOptions {
  connection_type?: ConnectionType;
  domain?: string;
  organization_id?: string;
  search?: string;
}
