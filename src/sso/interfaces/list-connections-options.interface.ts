import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
import { ConnectionType } from './connection-type.enum';

export interface ListConnectionsOptions extends PaginationOptions {
  connection_type?: ConnectionType;
  domain?: string;
}
