import * as publicSSO from '../public/sso';
import { UnknownRecord } from '../common/interfaces/unknown-record.interface';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import {
  Connection,
  ConnectionResponse,
  GetProfileAndTokenOptions,
  GetProfileOptions,
  ListConnectionsOptions,
  Profile,
  ProfileAndToken,
  ProfileAndTokenResponse,
  ProfileResponse,
  SSOAuthorizationURLOptions,
  SerializedListConnectionsOptions,
} from './interfaces';
import {
  deserializeConnection,
  deserializeProfile,
  deserializeProfileAndToken,
  serializeListConnectionsOptions,
} from './serializers';

export class SSO {
  constructor(private readonly workos: WorkOS) {}

  async listConnections(
    options?: ListConnectionsOptions,
  ): Promise<AutoPaginatable<Connection, SerializedListConnectionsOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<ConnectionResponse, Connection>(
        this.workos,
        '/connections',
        deserializeConnection,
        options ? serializeListConnectionsOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<ConnectionResponse, Connection>(
          this.workos,
          '/connections',
          deserializeConnection,
          params,
        ),
      options ? serializeListConnectionsOptions(options) : undefined,
    );
  }
  async deleteConnection(id: string) {
    await this.workos.delete(`/connections/${id}`);
  }

  getAuthorizationUrl(options: SSOAuthorizationURLOptions): string {
    // Delegate to public implementation
    return publicSSO.getAuthorizationUrl({
      ...options,
      baseURL: this.workos.baseURL,
    });
  }

  async getConnection(id: string): Promise<Connection> {
    const { data } = await this.workos.get<ConnectionResponse>(
      `/connections/${id}`,
    );

    return deserializeConnection(data);
  }

  async getProfileAndToken<
    CustomAttributesType extends UnknownRecord = UnknownRecord,
  >({
    code,
    clientId,
  }: GetProfileAndTokenOptions): Promise<
    ProfileAndToken<CustomAttributesType>
  > {
    const form = new URLSearchParams({
      client_id: clientId,
      client_secret: this.workos.key as string,
      grant_type: 'authorization_code',
      code,
    });

    const { data } = await this.workos.post<
      ProfileAndTokenResponse<CustomAttributesType>
    >('/sso/token', form);

    return deserializeProfileAndToken(data);
  }

  async getProfile<CustomAttributesType extends UnknownRecord = UnknownRecord>({
    accessToken,
  }: GetProfileOptions): Promise<Profile<CustomAttributesType>> {
    const { data } = await this.workos.get<
      ProfileResponse<CustomAttributesType>
    >('/sso/profile', {
      accessToken,
    });

    return deserializeProfile(data);
  }
}
