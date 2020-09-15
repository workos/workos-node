export interface PasswordlessSession {
  id: string,
  email: string,
  expires_at: Date,
  link: string,
  object: 'passwordless_session',
}
