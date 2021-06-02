export interface CreatePasswordlessSessionOptions {
  type: 'MagicLink';
  email: string;
  redirectURI?: string;
  state?: string;
  connection?: string;
  expiresIn?: number;
}
