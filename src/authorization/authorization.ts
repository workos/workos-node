import { WorkOS } from '../workos';
import {
  EnvironmentRole,
  EnvironmentRoleResponse,
  EnvironmentRoleList,
  EnvironmentRoleListResponse,
  CreateEnvironmentRoleOptions,
  UpdateEnvironmentRoleOptions,
  ListEnvironmentRolesOptions,
  SetEnvironmentRolePermissionsOptions,
  AddEnvironmentRolePermissionOptions,
  OrganizationRole,
  OrganizationRoleResponse,
  OrganizationRoleList,
  OrganizationRoleListResponse,
  CreateOrganizationRoleOptions,
  UpdateOrganizationRoleOptions,
  ListOrganizationRolesOptions,
} from './interfaces';
import {
  deserializeEnvironmentRole,
  serializeCreateEnvironmentRoleOptions,
  serializeUpdateEnvironmentRoleOptions,
  deserializeOrganizationRole,
  serializeCreateOrganizationRoleOptions,
  serializeUpdateOrganizationRoleOptions,
} from './serializers';

export class Authorization {
  constructor(private readonly workos: WorkOS) {}

  // === Environment Roles ===

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
    options: SetEnvironmentRolePermissionsOptions,
  ): Promise<EnvironmentRole> {
    const { data } = await this.workos.put<EnvironmentRoleResponse>(
      `/authorization/roles/${slug}/permissions`,
      { permissions: options.permissions },
    );
    return deserializeEnvironmentRole(data);
  }

  async addEnvironmentRolePermission(
    slug: string,
    options: AddEnvironmentRolePermissionOptions,
  ): Promise<EnvironmentRole> {
    const { data } = await this.workos.post<EnvironmentRoleResponse>(
      `/authorization/roles/${slug}/permissions`,
      { slug: options.permissionSlug },
    );
    return deserializeEnvironmentRole(data);
  }

  // === Organization Roles ===

  async createOrganizationRole(
    options: CreateOrganizationRoleOptions,
  ): Promise<OrganizationRole> {
    const { organizationId, ...payload } = options;
    const { data } = await this.workos.post<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles`,
      serializeCreateOrganizationRoleOptions(options),
    );
    return deserializeOrganizationRole(data);
  }

  async listOrganizationRoles(
    options: ListOrganizationRolesOptions,
  ): Promise<OrganizationRoleList> {
    const { organizationId, ...query } = options;
    const { data } = await this.workos.get<OrganizationRoleListResponse>(
      `/authorization/organizations/${organizationId}/roles`,
      { query },
    );
    return {
      object: 'list',
      data: data.data.map(deserializeOrganizationRole),
    };
  }

  async getOrganizationRole(
    organizationId: string,
    slug: string,
  ): Promise<OrganizationRole> {
    const { data } = await this.workos.get<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles/${slug}`,
    );
    return deserializeOrganizationRole(data);
  }

  async updateOrganizationRole(
    organizationId: string,
    slug: string,
    options: UpdateOrganizationRoleOptions,
  ): Promise<OrganizationRole> {
    const { data } = await this.workos.patch<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles/${slug}`,
      serializeUpdateOrganizationRoleOptions(options),
    );
    return deserializeOrganizationRole(data);
  }

  async deleteOrganizationRole(
    organizationId: string,
    slug: string,
  ): Promise<void> {
    await this.workos.delete(
      `/authorization/organizations/${organizationId}/roles/${slug}`,
    );
  }

  async setOrganizationRolePermissions(
    organizationId: string,
    slug: string,
    permissions: string[],
  ): Promise<OrganizationRole> {
    const { data } = await this.workos.put<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles/${slug}/permissions`,
      { permissions },
    );
    return deserializeOrganizationRole(data);
  }

  async addOrganizationRolePermission(
    organizationId: string,
    slug: string,
    permissionSlug: string,
  ): Promise<OrganizationRole> {
    const { data } = await this.workos.post<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles/${slug}/permissions`,
      { slug: permissionSlug },
    );
    return deserializeOrganizationRole(data);
  }

  async removeOrganizationRolePermission(
    organizationId: string,
    slug: string,
    permissionSlug: string,
  ): Promise<void> {
    await this.workos.delete(
      `/authorization/organizations/${organizationId}/roles/${slug}/permissions/${permissionSlug}`,
    );
  }
}
