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

  async getResourceByExternalId(
    options: GetAuthorizationResourceByExternalIdOptions,
  ): Promise<AuthorizationResource> {
    const { organizationId, resourceTypeSlug, externalId } = options;
    const { data } = await this.workos.get<AuthorizationResourceResponse>(
      `/authorization/organizations/${organizationId}/resources/${resourceTypeSlug}/${externalId}`,
    );
    return deserializeAuthorizationResource(data);
  }

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

  async check(
    options: AuthorizationCheckOptions,
  ): Promise<AuthorizationCheckResult> {
    const { data } = await this.workos.post<AuthorizationCheckResult>(
      `/authorization/organization_memberships/${options.organizationMembershipId}/check`,
      serializeAuthorizationCheckOptions(options),
    );
    return data;
  }

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

  async assignRole(options: AssignRoleOptions): Promise<RoleAssignment> {
    const { data } = await this.workos.post<RoleAssignmentResponse>(
      `/authorization/organization_memberships/${options.organizationMembershipId}/role_assignments`,
      serializeAssignRoleOptions(options),
    );
    return deserializeRoleAssignment(data);
  }

  async removeRole(options: RemoveRoleOptions): Promise<void> {
    await this.workos.deleteWithBody(
      `/authorization/organization_memberships/${options.organizationMembershipId}/role_assignments`,
      serializeRemoveRoleOptions(options),
    );
  }

  async removeRoleAssignment(
    options: RemoveRoleAssignmentOptions,
  ): Promise<void> {
    await this.workos.delete(
      `/authorization/organization_memberships/${options.organizationMembershipId}/role_assignments/${options.roleAssignmentId}`,
    );
  }

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

  async listEffectivePermissionsByExternalId(
    options: ListEffectivePermissionsByExternalIdOptions,
  ): Promise<AutoPaginatable<Permission>> {
    const {
      organizationMembershipId,
      organizationId,
      resourceTypeSlug,
      externalId,
    } = options;
    const endpoint = `/authorization/organizations/${organizationId}/resources/${resourceTypeSlug}/${externalId}/organization_memberships/${organizationMembershipId}/permissions`;
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
