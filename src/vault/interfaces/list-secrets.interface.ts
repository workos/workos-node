import { SecretListMetadata } from "./vault.interface";

export interface ListSecretsOptions {}

export interface ListSecretsResponse {
  data: string[];
  list_metadata: SecretListMetadata;
}
