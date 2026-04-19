import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import {
  ApiKey,
  SerializedApiKey,
  ListOrganizationApiKeysOptions,
  CreateOrganizationApiKeyOptions,
  CreateOrganizationApiKeyRequestOptions,
  CreatedApiKey,
  SerializedCreatedApiKey,
} from './interfaces';
import {
  deserializeApiKey,
  serializeCreateOrganizationApiKeyOptions,
  deserializeCreatedApiKey,
} from './serializers';
import {
  SerializedValidateApiKeyResponse,
  ValidateApiKeyOptions,
  ValidateApiKeyResponse,
} from './interfaces/validate-api-key.interface';
import { deserializeValidateApiKeyResponse } from './serializers/validate-api-key.serializer';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';

export class ApiKeys {
  constructor(private readonly workos: WorkOS) {}

  async createValidation(
    payload: ValidateApiKeyOptions,
  ): Promise<ValidateApiKeyResponse> {
    const { data } = await this.workos.post<SerializedValidateApiKeyResponse>(
      '/api_keys/validations',
      payload,
    );

    return deserializeValidateApiKeyResponse(data);
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.workos.delete(`/api_keys/${id}`);
  }

  async listOrganizationApiKeys(
    options: ListOrganizationApiKeysOptions,
  ): Promise<AutoPaginatable<ApiKey>> {
    const { organizationId, ...paginationOptions } = options;

    return new AutoPaginatable(
      await fetchAndDeserialize<SerializedApiKey, ApiKey>(
        this.workos,
        `/organizations/${organizationId}/api_keys`,
        deserializeApiKey,
        paginationOptions,
      ),
      (params) =>
        fetchAndDeserialize<SerializedApiKey, ApiKey>(
          this.workos,
          `/organizations/${organizationId}/api_keys`,
          deserializeApiKey,
          params,
        ),
      paginationOptions,
    );
  }

  async createOrganizationApiKey(
    options: CreateOrganizationApiKeyOptions,
    requestOptions: CreateOrganizationApiKeyRequestOptions = {},
  ): Promise<CreatedApiKey> {
    const { organizationId } = options;

    const { data } = await this.workos.post<SerializedCreatedApiKey>(
      `/organizations/${organizationId}/api_keys`,
      serializeCreateOrganizationApiKeyOptions(options),
      requestOptions,
    );

    return deserializeCreatedApiKey(data);
  }
}
