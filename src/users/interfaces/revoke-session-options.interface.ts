export type RevokeSessionOptions = SessionId | SessionToken;

interface SessionId {
  sessionId: string;
}

interface SessionToken {
  sessionToken: string;
}
