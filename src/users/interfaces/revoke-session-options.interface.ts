export type RevokeSessionOptions = SessionId | SessionToken;

export type SerializedRevokeSessionOptions =
  | SerializedSessionId
  | SerializedSessionToken;

interface SessionId {
  sessionId: string;
}

interface SerializedSessionId {
  session_id: string;
}

interface SessionToken {
  sessionToken: string;
}

interface SerializedSessionToken {
  session_token: string;
}
