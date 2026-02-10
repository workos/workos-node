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
  CreateAuthorizationResourceOptions,
  UpdateAuthorizationResourceOptions,
  AuthorizationCheckOptions,
  AuthorizationCheckResult,
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
  serializeAuthorizationCheckOptions,
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
   * Check if an organization membership has a specific permission on a resource.
   *
   * @param options - The check options
   * @param options.organizationMembershipId - The organization membership to check
   * @param options.permissionSlug - The permission to check (e.g., "documents:edit")
   * @param options.resourceId - Internal resource ID (mutually exclusive with external ID)
   * @param options.resourceExternalId - External resource ID (requires resourceTypeSlug)
   * @param options.resourceTypeSlug - Resource type slug (required with resourceExternalId)
   * @returns Object with `authorized` boolean
   *
   * @example
   * // Check by internal resource ID
   * const result = await workos.authorization.check({
   *   organizationMembershipId: 'om_01HXYZ...',
   *   permissionSlug: 'documents:edit',
   *   resourceId: 'resource_01HXYZ...',
   * });
   * console.log(result.authorized); // true or false
   *
   * @example
   * // Check by external ID
   * const result = await workos.authorization.check({
   *   organizationMembershipId: 'om_01HXYZ...',
   *   permissionSlug: 'documents:edit',
   *   resourceExternalId: 'doc-123',
   *   resourceTypeSlug: 'document',
   * });
   */
  async check(
    options: AuthorizationCheckOptions,
  ): Promise<AuthorizationCheckResult> {
    const { data } = await this.workos.post<AuthorizationCheckResult>(
      `/authorization/organization_memberships/${options.organizationMembershipId}/check`,
      serializeAuthorizationCheckOptions(options),
    );
    return data;
  }
}
