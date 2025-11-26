import type { WorkOS } from '../workos';
import {
  GetAccessTokenOptions,
  GetAccessTokenResponse,
  SerializedGetAccessTokenResponse,
} from './interfaces/get-access-token.interface';
import {
  serializeGetAccessTokenOptions,
  deserializeGetAccessTokenResponse,
} from './serializers/get-access-token.serializer';

export class Pipes {
  constructor(private readonly workos: WorkOS) {}

  async getAccessToken({
    provider,
    ...options
  }: GetAccessTokenOptions & {
    provider: string;
  }): Promise<GetAccessTokenResponse> {
    const { data } = await this.workos.post<SerializedGetAccessTokenResponse>(
      `data-integrations/${provider}/token`,
      serializeGetAccessTokenOptions(options),
    );

    return deserializeGetAccessTokenResponse(data);
  }
}
