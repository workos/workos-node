import { DirectoryUser } from '../../directory-sync/interfaces';

export interface WebhookDirectoryUser extends DirectoryUser {
  created_at: string;
  updated_at: string;
}
