import { Directory } from '../../directory-sync/interfaces';

export interface WebhookDirectory extends Omit<Directory, 'state'> {
  state:
    | 'active'
    | 'validating'
    | 'invalid_credentials'
    | 'inactive'
    | 'deleting';
}
