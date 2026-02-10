import { WorkOS } from '../workos';
import {
  Role,
  RoleList,
  OrganizationRoleResponse,
  ListOrganizationRolesResponse,
} from '../roles/interfaces';
import {
  EnvironmentRole,
  EnvironmentRoleResponse,
  EnvironmentRoleList,
  EnvironmentRoleListResponse,
  CreateEnvironmentRoleOptions,
  UpdateEnvironmentRoleOptions,
  SetEnvironmentRolePermissionsOptions,
  AddEnvironmentRolePermissionOptions,
  OrganizationRole,
  CreateOrganizationRoleOptions,
  UpdateOrganizationRoleOptions,
  SetOrganizationRolePermissionsOptions,
  AddOrganizationRolePermissionOptions,
  RemoveOrganizationRolePermissionOptions,
  Permission,
  PermissionResponse,
  PermissionList,
  PermissionListResponse,
  CreatePermissionOptions,
  UpdatePermissionOptions,
  ListPermissionsOptions,
  AuthorizationResource,
  AuthorizationResourceResponse,
  AuthorizationResourceList,
  AuthorizationResourceListResponse,
  CreateAuthorizationResourceOptions,
  UpdateAuthorizationResourceOptions,
  ListAuthorizationResourcesOptions,
  GetResourceByExternalIdOptions,
  UpdateResourceByExternalIdOptions,
  DeleteResourceByExternalIdOptions,
} from './interfaces';
import {
  deserializeEnvironmentRole,
  serializeCreateEnvironmentRoleOptions,
  serializeUpdateEnvironmentRoleOptions,
  deserializeRole,
  deserializeOrganizationRole,
  serializeCreateOrganizationRoleOptions,
  serializeUpdateOrganizationRoleOptions,
  deserializePermission,
  serializeCreatePermissionOptions,
  serializeUpdatePermissionOptions,
  deserializeAuthorizationResource,
  serializeCreateResourceOptions,
  serializeUpdateResourceOptions,
  serializeListAuthorizationResourcesOptions,
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

  async listEnvironmentRoles(): Promise<EnvironmentRoleList> {
    const { data } = await this.workos.get<EnvironmentRoleListResponse>(
      '/authorization/roles',
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

  async createOrganizationRole(
    organizationId: string,
    options: CreateOrganizationRoleOptions,
  ): Promise<OrganizationRole> {
    const { data } = await this.workos.post<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles`,
      serializeCreateOrganizationRoleOptions(options),
    );
    return deserializeOrganizationRole(data);
  }

  async listOrganizationRoles(organizationId: string): Promise<RoleList> {
    const { data } = await this.workos.get<ListOrganizationRolesResponse>(
      `/authorization/organizations/${organizationId}/roles`,
    );
    return {
      object: 'list',
      data: data.data.map(deserializeRole),
    };
  }

  async getOrganizationRole(
    organizationId: string,
    slug: string,
  ): Promise<Role> {
    const { data } = await this.workos.get<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles/${slug}`,
    );
    return deserializeRole(data);
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
    options: SetOrganizationRolePermissionsOptions,
  ): Promise<OrganizationRole> {
    const { data } = await this.workos.put<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles/${slug}/permissions`,
      { permissions: options.permissions },
    );
    return deserializeOrganizationRole(data);
  }

  async addOrganizationRolePermission(
    organizationId: string,
    slug: string,
    options: AddOrganizationRolePermissionOptions,
  ): Promise<OrganizationRole> {
    const { data } = await this.workos.post<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles/${slug}/permissions`,
      { slug: options.permissionSlug },
    );
    return deserializeOrganizationRole(data);
  }

  async removeOrganizationRolePermission(
    organizationId: string,
    slug: string,
    options: RemoveOrganizationRolePermissionOptions,
  ): Promise<void> {
    await this.workos.delete(
      `/authorization/organizations/${organizationId}/roles/${slug}/permissions/${options.permissionSlug}`,
    );
  }

  async createPermission(
    options: CreatePermissionOptions,
  ): Promise<Permission> {
    const { data } = await this.workos.post<PermissionResponse>(
      '/authorization/permissions',
      serializeCreatePermissionOptions(options),
    );
    return deserializePermission(data);
  }

  async listPermissions(
    options?: ListPermissionsOptions,
  ): Promise<PermissionList> {
    const { data } = await this.workos.get<PermissionListResponse>(
      '/authorization/permissions',
      { query: options },
    );
    return {
      object: 'list',
      data: data.data.map(deserializePermission),
      listMetadata: {
        before: data.list_metadata.before,
        after: data.list_metadata.after,
      },
    };
  }

  async getPermission(slug: string): Promise<Permission> {
    const { data } = await this.workos.get<PermissionResponse>(
      `/authorization/permissions/${slug}`,
    );
    return deserializePermission(data);
  }

  async updatePermission(
    slug: string,
    options: UpdatePermissionOptions,
  ): Promise<Permission> {
    const { data } = await this.workos.patch<PermissionResponse>(
      `/authorization/permissions/${slug}`,
      serializeUpdatePermissionOptions(options),
    );
    return deserializePermission(data);
  }

  async deletePermission(slug: string): Promise<void> {
    await this.workos.delete(`/authorization/permissions/${slug}`);
  }

  async getResource(resourceId: string): Promise<AuthorizationResource> {
    const { data } = await this.workos.get<AuthorizationResourceResponse>(
      `/authorization/resources/${resourceId}`,
    );
    return deserializeAuthorizationResource(data);
  }

  async createResource(
    options: CreateAuthorizationResourceOptions,
  ): Promise<AuthorizationResource> {
    const { data } = await this.workos.post<AuthorizationResourceResponse>(
      '/authorization/resources',
      serializeCreateResourceOptions(options),
    );
    return deserializeAuthorizationResource(data);
  }

  async updateResource(
    options: UpdateAuthorizationResourceOptions,
  ): Promise<AuthorizationResource> {
    const { data } = await this.workos.patch<AuthorizationResourceResponse>(
      `/authorization/resources/${options.resourceId}`,
      serializeUpdateResourceOptions(options),
    );
    return deserializeAuthorizationResource(data);
  }

  async deleteResource(resourceId: string): Promise<void> {
    await this.workos.delete(`/authorization/resources/${resourceId}`);
  }

  /**
   * List authorization resources with optional filtering and pagination.
   *
   * @param options - Filter and pagination options
   * @returns Paginated list of authorization resources
   */
  async listResources(
    options?: ListAuthorizationResourcesOptions,
  ): Promise<AuthorizationResourceList> {
    const { data } = await this.workos.get<AuthorizationResourceListResponse>(
      '/authorization/resources',
      {
        query: options
          ? serializeListAuthorizationResourcesOptions(options)
          : undefined,
      },
    );
    return {
      object: 'list',
      data: data.data.map(deserializeAuthorizationResource),
      listMetadata: {
        before: data.list_metadata.before,
        after: data.list_metadata.after,
      },
    };
  }

  /**
   * Get an authorization resource by its external ID.
   *
   * Uses the organization + resource type + external ID path format
   * to uniquely identify the resource.
   *
   * @param options - The organization ID, resource type slug, and external ID
   * @returns The authorization resource
   */
  async getResourceByExternalId(
    options: GetResourceByExternalIdOptions,
  ): Promise<AuthorizationResource> {
    const { organizationId, resourceTypeSlug, externalId } = options;
    const { data } = await this.workos.get<AuthorizationResourceResponse>(
      `/authorization/organizations/${organizationId}/resource_types/${resourceTypeSlug}/resources/${externalId}`,
    );
    return deserializeAuthorizationResource(data);
  }

  /**
   * Update an authorization resource by its external ID.
   *
   * Uses the organization + resource type + external ID path format.
   * At least one of name or description must be provided.
   *
   * @param options - The organization ID, resource type slug, external ID, and fields to update
   * @returns The updated authorization resource
   */
  async updateResourceByExternalId(
    options: UpdateResourceByExternalIdOptions,
  ): Promise<AuthorizationResource> {
    const { organizationId, resourceTypeSlug, externalId, ...updateFields } =
      options;
    const { data } = await this.workos.patch<AuthorizationResourceResponse>(
      `/authorization/organizations/${organizationId}/resource_types/${resourceTypeSlug}/resources/${externalId}`,
      serializeUpdateResourceOptions({ resourceId: '', ...updateFields }),
    );
    return deserializeAuthorizationResource(data);
  }

  /**
   * Delete an authorization resource by its external ID.
   *
   * Uses the organization + resource type + external ID path format
   * to uniquely identify the resource to delete.
   *
   * @param options - The organization ID, resource type slug, and external ID
   */
  async deleteResourceByExternalId(
    options: DeleteResourceByExternalIdOptions,
  ): Promise<void> {
    const { organizationId, resourceTypeSlug, externalId } = options;
    await this.workos.delete(
      `/authorization/organizations/${organizationId}/resource_types/${resourceTypeSlug}/resources/${externalId}`,
    );
  }
}
