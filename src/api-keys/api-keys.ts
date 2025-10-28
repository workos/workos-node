import { WorkOS } from '../workos';
import {
  SerializedValidateApiKeyResponse,
  ValidateApiKeyOptions,
  ValidateApiKeyResponse,
} from './interfaces/validate-api-key.interface';
import { deserializeValidateApiKeyResponse } from './serializers/validate-api-key.serializer';

export class ApiKeys {
  constructor(private readonly workos: WorkOS) {}

  async validateApiKey(
    payload: ValidateApiKeyOptions,
  ): Promise<ValidateApiKeyResponse> {
    const { data } = await this.workos.post<SerializedValidateApiKeyResponse>(
      '/api_keys/validations',
      payload,
    );

    return deserializeValidateApiKeyResponse(data);
  }
}
