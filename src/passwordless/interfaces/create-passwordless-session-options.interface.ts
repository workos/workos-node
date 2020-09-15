export interface CreatePasswordlessSessionOptions {
  email: string;
  state?: string;
  type: 'MagicLink';
}
