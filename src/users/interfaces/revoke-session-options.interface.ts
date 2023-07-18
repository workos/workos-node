export type RevokeSessionOptions = SessionId | SessionToken;

interface SessionId {
  session_id: string;
}

interface SessionToken {
  session_token: string;
}
