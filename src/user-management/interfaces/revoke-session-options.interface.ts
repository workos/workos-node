export interface RevokeSessionOptions {
  sessionId: string;
}

export interface SerializedRevokeSessionOptions {
  session_id: string;
}

export const serializeRevokeSessionOptions = (
  options: RevokeSessionOptions,
): SerializedRevokeSessionOptions => ({
  session_id: options.sessionId,
});
