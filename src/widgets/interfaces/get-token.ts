export type WidgetScope = 'widgets:users-table:manage';

export interface GetTokenOptions {
  organizationId: string;
  userId: string;
  scopes?: [WidgetScope];
}

export interface SerializedGetTokenOptions {
  organization_id: string;
  user_id: string;
  scopes?: [WidgetScope];
}

export const serializeGetTokenOptions = (
  options: GetTokenOptions,
): SerializedGetTokenOptions => ({
  organization_id: options.organizationId,
  user_id: options.userId,
  scopes: options.scopes,
});

export interface GetTokenResponse {
  token: string;
}

export interface GetTokenResponseResponse {
  token: string;
}

export const deserializeGetTokenResponse = (
  data: GetTokenResponseResponse,
): GetTokenResponse => ({
  token: data.token,
});
