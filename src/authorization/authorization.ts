import { WorkOS } from '../workos';
import {
  EnvironmentRole,
  EnvironmentRoleResponse,
  EnvironmentRoleList,
  EnvironmentRoleListResponse,
  CreateEnvironmentRoleOptions,
  UpdateEnvironmentRoleOptions,
  ListEnvironmentRolesOptions,
} from './interfaces';
import {
  deserializeEnvironmentRole,
  serializeCreateEnvironmentRoleOptions,
  serializeUpdateEnvironmentRoleOptions,
} from './serializers';

export class Authorization {
  constructor(private readonly workos: WorkOS) {}

  async createEnvironmentRole(
    options: CreateEnvironmentRoleOptions,
  ): Promise<EnvironmentRole> {
    const { data } = await this.workos.post<EnvironmentRoleResponse>(
      '/authorization/roles',
      serializeCreateEnvironmentRoleOptions(options),
    );
    return deserializeEnvironmentRole(data);
  }

  async listEnvironmentRoles(
    options?: ListEnvironmentRolesOptions,
  ): Promise<EnvironmentRoleList> {
    const { data } = await this.workos.get<EnvironmentRoleListResponse>(
      '/authorization/roles',
      { query: options },
    );
    return {
      object: 'list',
      data: data.data.map(deserializeEnvironmentRole),
    };
  }

  async getEnvironmentRole(slug: string): Promise<EnvironmentRole> {
    const { data } = await this.workos.get<EnvironmentRoleResponse>(
      `/authorization/roles/${slug}`,
    );
    return deserializeEnvironmentRole(data);
  }

  async updateEnvironmentRole(
    slug: string,
    options: UpdateEnvironmentRoleOptions,
  ): Promise<EnvironmentRole> {
    const { data } = await this.workos.patch<EnvironmentRoleResponse>(
      `/authorization/roles/${slug}`,
      serializeUpdateEnvironmentRoleOptions(options),
    );
    return deserializeEnvironmentRole(data);
  }

  async setEnvironmentRolePermissions(
    slug: string,
    permissions: string[],
  ): Promise<EnvironmentRole> {
    const { data } = await this.workos.put<EnvironmentRoleResponse>(
      `/authorization/roles/${slug}/permissions`,
      { permissions },
    );
    return deserializeEnvironmentRole(data);
  }

  async addEnvironmentRolePermission(
    slug: string,
    permissionSlug: string,
  ): Promise<EnvironmentRole> {
    const { data } = await this.workos.post<EnvironmentRoleResponse>(
      `/authorization/roles/${slug}/permissions`,
      { slug: permissionSlug },
    );
    return deserializeEnvironmentRole(data);
  }
}
