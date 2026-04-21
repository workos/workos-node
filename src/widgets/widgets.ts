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

  async createToken(payload: GetTokenOptions): Promise<GetTokenResponse> {
    const { data } = await this.workos.post<
      GetTokenResponseResponse,
      SerializedGetTokenOptions
    >('/widgets/token', serializeGetTokenOptions(payload));

    return deserializeGetTokenResponse(data);
  }
}
