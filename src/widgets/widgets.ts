import { WorkOS } from '../workos';
import {
  deserializeGetTokenResponse,
  GetTokenOptions,
  GetTokenResponse,
  GetTokenResponseResponse,
  SerializedGetTokenOptions,
  serializeGetTokenOptions,
} from './interfaces/get-token';

export class Widgets {
  constructor(private readonly workos: WorkOS) {}

  /**
   * Generate a widget token
   *
   * Generate a widget token scoped to an organization and user with the specified scopes.
   * @param payload - Object containing organizationId.
   * @returns {Promise<WidgetSessionTokenResponse>}
   * @throws {BadRequestException} 400
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async createToken(payload: GetTokenOptions): Promise<GetTokenResponse> {
    const { data } = await this.workos.post<
      GetTokenResponseResponse,
      SerializedGetTokenOptions
    >('/widgets/token', serializeGetTokenOptions(payload));

    return deserializeGetTokenResponse(data);
  }
}
