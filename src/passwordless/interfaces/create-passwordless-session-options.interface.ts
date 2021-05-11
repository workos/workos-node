export interface CreatePasswordlessSessionOptions {
  email: string;
  redirectURI?: string;
  state?: string;
  connection?: string;
  type: 'MagicLink';
}
