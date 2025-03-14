export interface ListSecretsOptions {}

export interface SecretDigestResponse {
  id: string;
  name: string;
  updated_at: string;
}

export interface ListSecretsPagination {
  after: string | null;
  before: string | null;
}

export interface ListSecretsResponse {
  data: SecretDigestResponse[];
  list_metadata: ListSecretsPagination;
}
