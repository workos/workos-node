export interface CreatePasswordlessSessionOptions {
  email: string;
  redirect_uri?: string;
  state?: string;
  type: 'MagicLink';
}
