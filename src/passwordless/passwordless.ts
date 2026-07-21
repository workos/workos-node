// @oagen-ignore-file
import { WorkOS } from '../workos';
import {
  CreatePasswordlessSessionOptions,
  PasswordlessSession,
  PasswordlessSessionResponse,
  SendSessionResponse,
  SerializedCreatePasswordlessSessionOptions,
} from './interfaces';
import { deserializePasswordlessSession } from './serializers/passwordless-session.serializer';
import { encodePathParameter } from '../common/utils/encode-path-parameter';

export class Passwordless {
  constructor(private readonly workos: WorkOS) {}

  async createSession({
    redirectURI,
    expiresIn,
    ...options
  }: CreatePasswordlessSessionOptions): Promise<PasswordlessSession> {
    const { data } = await this.workos.post<
      PasswordlessSessionResponse,
      SerializedCreatePasswordlessSessionOptions
    >('/passwordless/sessions', {
      ...options,
      redirect_uri: redirectURI,
      expires_in: expiresIn,
    });

    return deserializePasswordlessSession(data);
  }

  async sendSession(sessionId: string): Promise<SendSessionResponse> {
    const { data } = await this.workos.post(
      `/passwordless/sessions/${encodePathParameter(sessionId)}/send`,
      {},
    );
    return data;
  }
}
