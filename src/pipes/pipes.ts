import type { WorkOS } from '../workos';

interface GetAccessTokenOptions {
  userId: string;
  organizationId?: string | null;
}

interface SerializedGetAccessTokenOptions {
  user_id: string;
  organization_id?: string | null;
}

interface GetAccessTokenResponse {
  accessToken: string;
  expiresAt: string | null;
  scopes: string[];
  missingScopes: string[];
}

interface AccessToken {
  accessToken: string;
  expiresAt: Date | null;
  scopes: string[];
  missingScopes: string[];
}

const serializeGetAccessTokenOptions = (
  options: GetAccessTokenOptions,
): SerializedGetAccessTokenOptions => ({
  user_id: options.userId,
  organization_id: options.organizationId,
});

const deserializeGetAccessTokenResponse = (
  accessTokenResponse: GetAccessTokenResponse,
): AccessToken => ({
  ...accessTokenResponse,
  expiresAt: accessTokenResponse.expiresAt
    ? new Date(Date.parse(accessTokenResponse.expiresAt))
    : null,
});

export class Pipes {
  constructor(private readonly workos: WorkOS) {}

  async getAccessToken({
    provider,
    ...options
  }: GetAccessTokenOptions & {
    provider: string;
  }): Promise<AccessToken> {
    const { data } = await this.workos.post<
      GetAccessTokenResponse,
      SerializedGetAccessTokenOptions
    >(
      `data-integrations/${provider}/token`,
      serializeGetAccessTokenOptions(options),
    );

    return deserializeGetAccessTokenResponse(data);
  }
}
