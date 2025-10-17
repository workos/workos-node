import {
  AccessToken,
  SerializedAccessToken,
} from '../interfaces/access-token.interface';

export function deserializeAccessToken(
  serialized: SerializedAccessToken,
): AccessToken {
  return {
    object: 'access_token',
    accessToken: serialized.access_token,
    expiresAt: serialized.expires_at
      ? new Date(Date.parse(serialized.expires_at))
      : null,
    scopes: serialized.scopes,
    missingScopes: serialized.missing_scopes,
  };
}
