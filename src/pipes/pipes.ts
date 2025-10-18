import type { WorkOS } from '../workos';
import { NotFoundException } from '../common/exceptions/not-found.exception';
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
    try {
      const { data } = await this.workos.post<SerializedGetAccessTokenResponse>(
        `data-integrations/${provider}/token`,
        serializeGetAccessTokenOptions(options),
      );

      return deserializeGetAccessTokenResponse(data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          accessToken: null,
          reason: 'not_installed',
        };
      }

      throw error;
    }
  }
}
