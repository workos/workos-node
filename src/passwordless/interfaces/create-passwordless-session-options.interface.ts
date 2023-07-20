export interface CreatePasswordlessSessionOptions {
  type: 'MagicLink';
  email: string;
  redirect_uri?: string;
  state?: string;
  connection?: string;
  expires_in?: number;
}
