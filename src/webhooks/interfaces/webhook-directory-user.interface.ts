import { User } from "../../directory-sync/interfaces";

export interface WebhookDirectoryUser extends User {
  created_at: string;
  updated_at: string;
}
