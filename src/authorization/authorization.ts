import { WorkOS } from '../workos';
import { AutoPaginatable } from '../common/utils/pagination';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
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
  CreatePermissionOptions,
  UpdatePermissionOptions,
  ListPermissionsOptions,
  AuthorizationResource,
  AuthorizationResourceResponse,
  ListAuthorizationResourcesOptions,
  GetAuthorizationResourceByExternalIdOptions,
  UpdateAuthorizationResourceByExternalIdOptions,
  DeleteAuthorizationResourceByExternalIdOptions,
  DeleteAuthorizationResourceOptions,
  CreateAuthorizationResourceOptions,
  UpdateAuthorizationResourceOptions,
  AuthorizationCheckOptions,
  AuthorizationCheckResult,
  AssignRoleOptions,
  ListRoleAssignmentsOptions,
  RemoveRoleAssignmentOptions,
  RemoveRoleOptions,
  RoleAssignment,
  RoleAssignmentResponse,
  ListMembershipsForResourceByExternalIdOptions,
  ListMembershipsForResourceOptions,
  ListResourcesForMembershipOptions,
  ListEffectivePermissionsOptions,
  ListEffectivePermissionsByExternalIdOptions,
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
  serializeUpdateResourceByExternalIdOptions,
  serializeListAuthorizationResourcesOptions,
  serializeAuthorizationCheckOptions,
  deserializeRoleAssignment,
  serializeAssignRoleOptions,
  serializeRemoveRoleOptions,
  serializeListMembershipsForResourceOptions,
  serializeListResourcesForMembershipOptions,
  serializeListEffectivePermissionsOptions,
} from './serializers';
import {
  AuthorizationOrganizationMembership,
  AuthorizationOrganizationMembershipResponse,
} from '../user-management/interfaces/organization-membership.interface';
import { deserializeAuthorizationOrganizationMembership } from '../user-management/serializers/organization-membership.serializer';

export class Authorization {
  constructor(private readonly workos: WorkOS) {}

  /**
   * Create an environment role
   *
   * Create a new environment role.
   * @param options - Object containing slug, name.
   * @returns {Promise<EnvironmentRole>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
  async createEnvironmentRole(
    options: CreateEnvironmentRoleOptions,
  ): Promise<EnvironmentRole> {
    const { data } = await this.workos.post<EnvironmentRoleResponse>(
      '/authorization/roles',
      serializeCreateEnvironmentRoleOptions(options),
    );
    return deserializeEnvironmentRole(data);
  }

  /**
   * List environment roles
   *
   * List all environment roles in priority order.
   * @returns {Promise<EnvironmentRoleList>}
   * @throws 403 response from the API.
   */
  async listEnvironmentRoles(): Promise<EnvironmentRoleList> {
    const { data } = await this.workos.get<EnvironmentRoleListResponse>(
      '/authorization/roles',
    );
    return {
      object: 'list',
      data: data.data.map(deserializeEnvironmentRole),
    };
  }

  /**
   * Get an environment role
   *
   * Get an environment role by its slug.
   * @param slug - The slug of the environment role.
   *
   * @example
   * "admin"
   *
   * @returns {Promise<EnvironmentRole>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async getEnvironmentRole(slug: string): Promise<EnvironmentRole> {
    const { data } = await this.workos.get<EnvironmentRoleResponse>(
      `/authorization/roles/${slug}`,
    );
    return deserializeEnvironmentRole(data);
  }

  /**
   * Update an environment role
   *
   * Update an existing environment role.
   * @param slug - The slug of the environment role.
   *
   * @example
   * "admin"
   *
   * @param options - The request body.
   * @returns {Promise<EnvironmentRole>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * Set permissions for an environment role
   *
   * Replace all permissions on an environment role with the provided list.
   * @param slug - The slug of the environment role.
   *
   * @example
   * "admin"
   *
   * @param options - Object containing permissions.
   * @returns {Promise<EnvironmentRole>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * Add a permission to an environment role
   *
   * Add a single permission to an environment role. If the permission is already assigned to the role, this operation has no effect.
   * @param slug - The slug of the environment role.
   *
   * @example
   * "admin"
   *
   * @param options - Object containing slug.
   * @returns {Promise<EnvironmentRole>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * Create a custom role
   *
   * Create a new custom role for this organization.
   * @param organizationId - The ID of the organization.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param options - Object containing name.
   * @returns {Promise<OrganizationRole>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * List custom roles
   *
   * Get a list of all roles that apply to an organization. This includes both environment roles and custom roles, returned in priority order.
   * @param organizationId - The ID of the organization.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @returns {Promise<RoleList>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async listOrganizationRoles(organizationId: string): Promise<RoleList> {
    const { data } = await this.workos.get<ListOrganizationRolesResponse>(
      `/authorization/organizations/${organizationId}/roles`,
    );
    return {
      object: 'list',
      data: data.data.map(deserializeRole),
    };
  }

  /**
   * Get a custom role
   *
   * Retrieve a role that applies to an organization by its slug. This can return either an environment role or a custom role.
   * @param organizationId - The ID of the organization.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param slug - The slug of the role.
   *
   * @example
   * "org-billing-admin"
   *
   * @returns {Promise<Role>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async getOrganizationRole(
    organizationId: string,
    slug: string,
  ): Promise<Role> {
    const { data } = await this.workos.get<OrganizationRoleResponse>(
      `/authorization/organizations/${organizationId}/roles/${slug}`,
    );
    return deserializeRole(data);
  }

  /**
   * Update a custom role
   *
   * Update an existing custom role. Only the fields provided in the request body will be updated.
   * @param organizationId - The ID of the organization.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param slug - The slug of the role.
   *
   * @example
   * "org-billing-admin"
   *
   * @param options - The request body.
   * @returns {Promise<OrganizationRole>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * Delete a custom role
   *
   * Delete an existing custom role.
   * @param organizationId - The ID of the organization.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param slug - The slug of the role.
   *
   * @example
   * "org-admin"
   *
   * @returns {Promise<void>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   */
  async deleteOrganizationRole(
    organizationId: string,
    slug: string,
  ): Promise<void> {
    await this.workos.delete(
      `/authorization/organizations/${organizationId}/roles/${slug}`,
    );
  }

  /**
   * Set permissions for a custom role
   *
   * Replace all permissions on a custom role with the provided list.
   * @param organizationId - The ID of the organization.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param slug - The slug of the role.
   *
   * @example
   * "org-admin"
   *
   * @param options - Object containing permissions.
   * @returns {Promise<Role>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * Add a permission to a custom role
   *
   * Add a single permission to a custom role. If the permission is already assigned to the role, this operation has no effect.
   * @param organizationId - The ID of the organization.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param slug - The slug of the role.
   *
   * @example
   * "org-admin"
   *
   * @param options - Object containing slug.
   * @returns {Promise<Role>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * Remove a permission from a custom role
   *
   * Remove a single permission from a custom role by its slug.
   * @param organizationId - The ID of the organization.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param slug - The slug of the role.
   *
   * @example
   * "org-admin"
   *
   * @param permissionSlug - The slug of the permission to remove.
   *
   * @example
   * "documents:read"
   *
   * @returns {Promise<void>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async removeOrganizationRolePermission(
    organizationId: string,
    slug: string,
    options: RemoveOrganizationRolePermissionOptions,
  ): Promise<void> {
    await this.workos.delete(
      `/authorization/organizations/${organizationId}/roles/${slug}/permissions/${options.permissionSlug}`,
    );
  }

  /**
   * Create a permission
   *
   * Create a new permission in your WorkOS environment. The permission can then be assigned to environment roles and custom roles.
   * @param options - Object containing slug, name.
   * @returns {Promise<Permission>}
   * @throws {BadRequestException} 400
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
  async createPermission(
    options: CreatePermissionOptions,
  ): Promise<Permission> {
    const { data } = await this.workos.post<PermissionResponse>(
      '/authorization/permissions',
      serializeCreatePermissionOptions(options),
    );
    return deserializePermission(data);
  }

  /**
   * List permissions
   *
   * Get a list of all permissions in your WorkOS environment.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<Permission, PaginationOptions>>}
   * @throws {NotFoundException} 404
   */
  async listPermissions(
    options?: ListPermissionsOptions,
  ): Promise<AutoPaginatable<Permission>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<PermissionResponse, Permission>(
        this.workos,
        '/authorization/permissions',
        deserializePermission,
        options,
      ),
      (params) =>
        fetchAndDeserialize<PermissionResponse, Permission>(
          this.workos,
          '/authorization/permissions',
          deserializePermission,
          params,
        ),
      options,
    );
  }

  /**
   * Get a permission
   *
   * Retrieve a permission by its unique slug.
   * @param slug - A unique key to reference the permission. Must be lowercase and contain only letters, numbers, hyphens, underscores, colons, periods, and asterisks.
   *
   * @example
   * "documents:read"
   *
   * @returns {Promise<Permission>}
   * @throws {NotFoundException} 404
   */
  async getPermission(slug: string): Promise<Permission> {
    const { data } = await this.workos.get<PermissionResponse>(
      `/authorization/permissions/${slug}`,
    );
    return deserializePermission(data);
  }

  /**
   * Update a permission
   *
   * Update an existing permission. Only the fields provided in the request body will be updated.
   * @param slug - A unique key to reference the permission. Must be lowercase and contain only letters, numbers, hyphens, underscores, colons, periods, and asterisks.
   *
   * @example
   * "documents:read"
   *
   * @param options - The request body.
   * @returns {Promise<Permission>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
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

  /**
   * Delete a permission
   *
   * Delete an existing permission. System permissions cannot be deleted.
   * @param slug - A unique key to reference the permission. Must be lowercase and contain only letters, numbers, hyphens, underscores, colons, periods, and asterisks.
   *
   * @example
   * "documents:read"
   *
   * @returns {Promise<void>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async deletePermission(slug: string): Promise<void> {
    await this.workos.delete(`/authorization/permissions/${slug}`);
  }

  /**
   * Get a resource
   *
   * Retrieve the details of an authorization resource by its ID.
   * @param resourceId - The ID of the authorization resource.
   *
   * @example
   * "authz_resource_01HXYZ123456789ABCDEFGHIJ"
   *
   * @returns {Promise<AuthorizationResource>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async getResource(resourceId: string): Promise<AuthorizationResource> {
    const { data } = await this.workos.get<AuthorizationResourceResponse>(
      `/authorization/resources/${resourceId}`,
    );
    return deserializeAuthorizationResource(data);
  }

  /**
   * Create an authorization resource
   *
   * Create a new authorization resource.
   * @param options - Object containing externalId, name, resourceTypeSlug, organizationId.
   * @returns {Promise<AuthorizationResource>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
  async createResource(
    options: CreateAuthorizationResourceOptions,
  ): Promise<AuthorizationResource> {
    const { data } = await this.workos.post<AuthorizationResourceResponse>(
      '/authorization/resources',
      serializeCreateResourceOptions(options),
    );
    return deserializeAuthorizationResource(data);
  }

  /**
   * Update a resource
   *
   * Update an existing authorization resource.
   * @param options - The request body.
   * @returns {Promise<AuthorizationResource>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
  async updateResource(
    options: UpdateAuthorizationResourceOptions,
  ): Promise<AuthorizationResource> {
    const { data } = await this.workos.patch<AuthorizationResourceResponse>(
      `/authorization/resources/${options.resourceId}`,
      serializeUpdateResourceOptions(options),
    );
    return deserializeAuthorizationResource(data);
  }

  /**
   * Delete an authorization resource
   *
   * Delete an authorization resource and all its descendants.
   * @param options.cascadeDelete - If true, deletes all descendant resources and role assignments. If not set and the resource has children or assignments, the request will fail.
   * @default false
   * @param options - Additional query options.
   * @returns {Promise<void>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   */
  async deleteResource(
    options: DeleteAuthorizationResourceOptions,
  ): Promise<void> {
    const { resourceId, cascadeDelete } = options;

    const query =
      cascadeDelete !== undefined
        ? { cascade_delete: cascadeDelete.toString() }
        : undefined;

    await this.workos.delete(`/authorization/resources/${resourceId}`, query);
  }

  /**
   * List resources
   *
   * Get a paginated list of authorization resources.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<AuthorizationResource, PaginationOptions>>}
   * @throws 403 response from the API.
   * @throws {UnprocessableEntityException} 422
   */
  async listResources(
    options: ListAuthorizationResourcesOptions = {},
  ): Promise<AutoPaginatable<AuthorizationResource>> {
    const serializedOptions =
      serializeListAuthorizationResourcesOptions(options);
    return new AutoPaginatable(
      await fetchAndDeserialize<
        AuthorizationResourceResponse,
        AuthorizationResource
      >(
        this.workos,
        '/authorization/resources',
        deserializeAuthorizationResource,
        serializedOptions,
      ),
      (params) =>
        fetchAndDeserialize<
          AuthorizationResourceResponse,
          AuthorizationResource
        >(
          this.workos,
          '/authorization/resources',
          deserializeAuthorizationResource,
          params,
        ),
      serializedOptions,
    );
  }

  /**
   * Get a resource by external ID
   *
   * Retrieve the details of an authorization resource by its external ID, organization, and resource type. This is useful when you only have the external ID from your system and need to fetch the full resource details.
   * @param organizationId - The ID of the organization that owns the resource.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param resourceTypeSlug - The slug of the resource type.
   *
   * @example
   * "project"
   *
   * @param externalId - An identifier you provide to reference the resource in your system.
   *
   * @example
   * "proj-456"
   *
   * @returns {Promise<AuthorizationResource>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async getResourceByExternalId(
    options: GetAuthorizationResourceByExternalIdOptions,
  ): Promise<AuthorizationResource> {
    const { organizationId, resourceTypeSlug, externalId } = options;
    const { data } = await this.workos.get<AuthorizationResourceResponse>(
      `/authorization/organizations/${organizationId}/resources/${resourceTypeSlug}/${externalId}`,
    );
    return deserializeAuthorizationResource(data);
  }

  /**
   * Update a resource by external ID
   *
   * Update an existing authorization resource using its external ID.
   * @param organizationId - The ID of the organization that owns the resource.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param resourceTypeSlug - The slug of the resource type.
   *
   * @example
   * "project"
   *
   * @param externalId - An identifier you provide to reference the resource in your system.
   *
   * @example
   * "proj-456"
   *
   * @param options - The request body.
   * @returns {Promise<AuthorizationResource>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
  async updateResourceByExternalId(
    options: UpdateAuthorizationResourceByExternalIdOptions,
  ): Promise<AuthorizationResource> {
    const { organizationId, resourceTypeSlug, externalId } = options;
    const { data } = await this.workos.patch<AuthorizationResourceResponse>(
      `/authorization/organizations/${organizationId}/resources/${resourceTypeSlug}/${externalId}`,
      serializeUpdateResourceByExternalIdOptions(options),
    );
    return deserializeAuthorizationResource(data);
  }
  /**
   * Delete an authorization resource by external ID
   *
   * Delete an authorization resource by organization, resource type, and external ID. This also deletes all descendant resources.
   * @param organizationId - The ID of the organization that owns the resource.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param resourceTypeSlug - The slug of the resource type.
   *
   * @example
   * "project"
   *
   * @param externalId - An identifier you provide to reference the resource in your system.
   *
   * @example
   * "proj-456"
   *
   * @param options - Additional query options.
   * @returns {Promise<void>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   */
  async deleteResourceByExternalId(
    options: DeleteAuthorizationResourceByExternalIdOptions,
  ): Promise<void> {
    const { organizationId, resourceTypeSlug, externalId, cascadeDelete } =
      options;

    const query =
      cascadeDelete !== undefined
        ? { cascade_delete: cascadeDelete.toString() }
        : undefined;

    await this.workos.delete(
      `/authorization/organizations/${organizationId}/resources/${resourceTypeSlug}/${externalId}`,
      query,
    );
  }

  /**
   * Check authorization
   *
   * Check if an organization membership has a specific permission on a resource. Supports identification by resource_id OR by resource_external_id + resource_type_slug.
   * @param options - Object containing permissionSlug.
   * @returns {Promise<AuthorizationCheckResult>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
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

  /**
   * List role assignments
   *
   * List all role assignments for an organization membership. This returns all roles that have been assigned to the user on resources, including organization-level and sub-resource roles.
   * @param organizationMembershipId - The ID of the organization membership.
   *
   * @example
   * "om_01HXYZ123456789ABCDEFGHIJ"
   *
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<RoleAssignment>>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async listRoleAssignments(
    options: ListRoleAssignmentsOptions,
  ): Promise<AutoPaginatable<RoleAssignment>> {
    const { organizationMembershipId, ...queryOptions } = options;
    const endpoint = `/authorization/organization_memberships/${organizationMembershipId}/role_assignments`;
    return new AutoPaginatable(
      await fetchAndDeserialize<RoleAssignmentResponse, RoleAssignment>(
        this.workos,
        endpoint,
        deserializeRoleAssignment,
        queryOptions,
      ),
      (params) =>
        fetchAndDeserialize<RoleAssignmentResponse, RoleAssignment>(
          this.workos,
          endpoint,
          deserializeRoleAssignment,
          params,
        ),
      queryOptions,
    );
  }

  /**
   * Assign a role
   *
   * Assign a role to an organization membership on a specific resource.
   * @param options - Object containing roleSlug.
   * @returns {Promise<RoleAssignment>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async assignRole(options: AssignRoleOptions): Promise<RoleAssignment> {
    const { data } = await this.workos.post<RoleAssignmentResponse>(
      `/authorization/organization_memberships/${options.organizationMembershipId}/role_assignments`,
      serializeAssignRoleOptions(options),
    );
    return deserializeRoleAssignment(data);
  }

  /**
   * Remove a role assignment
   *
   * Remove a role assignment by role slug and resource.
   * @param options - Object containing roleSlug.
   * @returns {Promise<void>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async removeRole(options: RemoveRoleOptions): Promise<void> {
    await this.workos.deleteWithBody(
      `/authorization/organization_memberships/${options.organizationMembershipId}/role_assignments`,
      serializeRemoveRoleOptions(options),
    );
  }

  /**
   * Remove a role assignment by ID
   *
   * Remove a role assignment using its ID.
   * @param organizationMembershipId - The ID of the organization membership.
   *
   * @example
   * "om_01HXYZ123456789ABCDEFGHIJ"
   *
   * @param roleAssignmentId - The ID of the role assignment to remove.
   *
   * @example
   * "role_assignment_01HXYZ123456789ABCDEFGH"
   *
   * @returns {Promise<void>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   */
  async removeRoleAssignment(
    options: RemoveRoleAssignmentOptions,
  ): Promise<void> {
    await this.workos.delete(
      `/authorization/organization_memberships/${options.organizationMembershipId}/role_assignments/${options.roleAssignmentId}`,
    );
  }

  /**
   * List resources for organization membership
   *
   * Returns all child resources of a parent resource where the organization membership has a specific permission. This is useful for resource discovery—answering "What projects can this user access in this workspace?"
   *
   * You must provide either `parent_resource_id` or both `parent_resource_external_id` and `parent_resource_type_slug` to identify the parent resource.
   * @param organizationMembershipId - The ID of the organization membership.
   *
   * @example
   * "om_01HXYZ123456789ABCDEFGHIJ"
   *
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<AuthorizationResource>>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async listResourcesForMembership(
    options: ListResourcesForMembershipOptions,
  ): Promise<AutoPaginatable<AuthorizationResource>> {
    const { organizationMembershipId } = options;
    const endpoint = `/authorization/organization_memberships/${organizationMembershipId}/resources`;
    const serializedOptions =
      serializeListResourcesForMembershipOptions(options);
    return new AutoPaginatable(
      await fetchAndDeserialize<
        AuthorizationResourceResponse,
        AuthorizationResource
      >(
        this.workos,
        endpoint,
        deserializeAuthorizationResource,
        serializedOptions,
      ),
      (params) =>
        fetchAndDeserialize<
          AuthorizationResourceResponse,
          AuthorizationResource
        >(this.workos, endpoint, deserializeAuthorizationResource, params),
      serializedOptions,
    );
  }

  /**
   * List organization memberships for resource
   *
   * Returns all organization memberships that have a specific permission on a resource instance. This is useful for answering "Who can access this resource?".
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<BaseOrganizationMembership, PaginationOptions>>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async listMembershipsForResource(
    options: ListMembershipsForResourceOptions,
  ): Promise<AutoPaginatable<AuthorizationOrganizationMembership>> {
    const { resourceId } = options;
    const endpoint = `/authorization/resources/${resourceId}/organization_memberships`;
    const serializedOptions =
      serializeListMembershipsForResourceOptions(options);
    return new AutoPaginatable(
      await fetchAndDeserialize<
        AuthorizationOrganizationMembershipResponse,
        AuthorizationOrganizationMembership
      >(
        this.workos,
        endpoint,
        deserializeAuthorizationOrganizationMembership,
        serializedOptions,
      ),
      (params) =>
        fetchAndDeserialize<
          AuthorizationOrganizationMembershipResponse,
          AuthorizationOrganizationMembership
        >(
          this.workos,
          endpoint,
          deserializeAuthorizationOrganizationMembership,
          params,
        ),
      serializedOptions,
    );
  }

  /**
   * List memberships for a resource by external ID
   *
   * Returns all organization memberships that have a specific permission on a resource, using the resource's external ID. This is useful for answering "Who can access this resource?" when you only have the external ID.
   * @param organizationId - The ID of the organization that owns the resource.
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @param resourceTypeSlug - The slug of the resource type this resource belongs to.
   *
   * @example
   * "project"
   *
   * @param externalId - An identifier you provide to reference the resource in your system.
   *
   * @example
   * "proj-456"
   *
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<UserOrganizationMembershipBaseListData>>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async listMembershipsForResourceByExternalId(
    options: ListMembershipsForResourceByExternalIdOptions,
  ): Promise<AutoPaginatable<AuthorizationOrganizationMembership>> {
    const { organizationId, resourceTypeSlug, externalId } = options;
    const endpoint = `/authorization/organizations/${organizationId}/resources/${resourceTypeSlug}/${externalId}/organization_memberships`;
    const serializedOptions =
      serializeListMembershipsForResourceOptions(options);
    return new AutoPaginatable(
      await fetchAndDeserialize<
        AuthorizationOrganizationMembershipResponse,
        AuthorizationOrganizationMembership
      >(
        this.workos,
        endpoint,
        deserializeAuthorizationOrganizationMembership,
        serializedOptions,
      ),
      (params) =>
        fetchAndDeserialize<
          AuthorizationOrganizationMembershipResponse,
          AuthorizationOrganizationMembership
        >(
          this.workos,
          endpoint,
          deserializeAuthorizationOrganizationMembership,
          params,
        ),
      serializedOptions,
    );
  }

  /**
   * List effective permissions for an organization membership on a resource
   *
   * Returns all permissions the organization membership effectively has on a resource, including permissions inherited through roles assigned to ancestor resources.
   * @param organizationMembershipId - The ID of the organization membership.
   *
   * @example
   * "om_01HXYZ123456789ABCDEFGHIJ"
   *
   * @param resourceId - The ID of the authorization resource.
   *
   * @example
   * "authz_resource_01HXYZ123456789ABCDEFGHIJ"
   *
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<AuthorizationPermission>>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async listEffectivePermissions(
    options: ListEffectivePermissionsOptions,
  ): Promise<AutoPaginatable<Permission>> {
    const { organizationMembershipId, resourceId } = options;
    const endpoint = `/authorization/resources/${resourceId}/organization_memberships/${organizationMembershipId}/permissions`;
    const serializedOptions = serializeListEffectivePermissionsOptions(options);
    return new AutoPaginatable(
      await fetchAndDeserialize<PermissionResponse, Permission>(
        this.workos,
        endpoint,
        deserializePermission,
        serializedOptions,
      ),
      (params) =>
        fetchAndDeserialize<PermissionResponse, Permission>(
          this.workos,
          endpoint,
          deserializePermission,
          params,
        ),
      serializedOptions,
    );
  }

  /**
   * List effective permissions for an organization membership on a resource by external ID
   *
   * Returns all permissions the organization membership effectively has on a resource identified by its external ID, including permissions inherited through roles assigned to ancestor resources.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<Permission, PaginationOptions>>}
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {UnprocessableEntityException} 422
   */
  async listEffectivePermissionsByExternalId(
    options: ListEffectivePermissionsByExternalIdOptions,
  ): Promise<AutoPaginatable<Permission>> {
    const { organizationMembershipId, resourceTypeSlug, externalId } = options;
    const endpoint = `/authorization/organization_memberships/${organizationMembershipId}/resources/${resourceTypeSlug}/${externalId}/permissions`;
    const serializedOptions = serializeListEffectivePermissionsOptions(options);
    return new AutoPaginatable(
      await fetchAndDeserialize<PermissionResponse, Permission>(
        this.workos,
        endpoint,
        deserializePermission,
        serializedOptions,
      ),
      (params) =>
        fetchAndDeserialize<PermissionResponse, Permission>(
          this.workos,
          endpoint,
          deserializePermission,
          params,
        ),
      serializedOptions,
    );
  }
}
