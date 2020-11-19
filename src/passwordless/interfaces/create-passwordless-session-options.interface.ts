export interface CreatePasswordlessSessionOptions {
  email: string;
  redirectURI?: string;
  state?: string;
  type: 'MagicLink';
}
