import {
  AccessToken,
  SerializedAccessToken,
} from '../interfaces/access-token.interface';

export function deserializeAccessToken(
  serialized: SerializedAccessToken,
): AccessToken {
  return {
    token: serialized.accessToken,
    expiresAt: serialized.expiresAt
      ? new Date(Date.parse(serialized.expiresAt))
      : null,
    scopes: serialized.scopes,
    missingScopes: serialized.missingScopes,
  };
}
