export interface SecretVersionResponse {
  id: string;
  created_at: string;
  current_version: boolean;
}

export interface ListSecretVersionsResponse {
  data: SecretVersionResponse[];
}
