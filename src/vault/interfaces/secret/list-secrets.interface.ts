import { SecretListMetadata } from "../secret.interface";

export interface ListSecretsOptions {}

export interface SecretDigestResponse {
  id: string;
  name: string;
  updated_at: string;
}

export interface ListSecretsResponse {
  data: SecretDigestResponse[];
  list_metadata: SecretListMetadata;
}
