import {
  RevokeSessionOptions,
  SerializedRevokeSessionOptions,
} from '../interfaces';

export const serializeRevokeSessionOptions = (
  options: RevokeSessionOptions,
): SerializedRevokeSessionOptions => {
  if ('sessionId' in options) {
    return {
      session_id: options.sessionId,
    };
  }

  return {
    session_token: options.sessionToken,
  };
};
