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
  RoleAssignmentList,
  RoleAssignmentListResponse,
  RoleAssignmentResponse,
  OrganizationMembershipList,
  OrganizationMembershipListResponse,
  ListMembershipsForResourceByExternalIdOptions,
  ListMembershipsForResourceOptions,
  ListResourcesForMembershipOptions,
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
} from './serializers';
import { deserializeOrganizationMembership } from '../user-management/serializers/organization-membership.serializer';

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
  ): Promise<AuthorizationResourceList> {
    const { data } = await this.workos.get<AuthorizationResourceListResponse>(
      '/authorization/resources',
      { query: serializeListAuthorizationResourcesOptions(options) },
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

  // haven't tesed
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
  ): Promise<RoleAssignmentList> {
    const { organizationMembershipId, ...queryOptions } = options;
    const { data } = await this.workos.get<RoleAssignmentListResponse>(
      `/authorization/organization_memberships/${organizationMembershipId}/role_assignments`,
      { query: queryOptions },
    );
    return {
      object: 'list',
      data: data.data.map(deserializeRoleAssignment),
      listMetadata: {
        before: data.list_metadata.before,
        after: data.list_metadata.after,
      },
    };
  }

  async assignRole(options: AssignRoleOptions): Promise<RoleAssignment> {
    const { data } = await this.workos.post<RoleAssignmentResponse>(
      `/authorization/organization_memberships/${options.organizationMembershipId}/role_assignments`,
      serializeAssignRoleOptions(options),
    );
    return deserializeRoleAssignment(data);
  }

  // test this
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
  ): Promise<AuthorizationResourceList> {
    const { organizationMembershipId } = options;
    const { data } = await this.workos.get<AuthorizationResourceListResponse>(
      `/authorization/organization_memberships/${organizationMembershipId}/resources`,
      {
        query: serializeListResourcesForMembershipOptions(options),
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

  async listMembershipsForResource(
    options: ListMembershipsForResourceOptions,
  ): Promise<OrganizationMembershipList> {
    const { resourceId } = options;
    const { data } = await this.workos.get<OrganizationMembershipListResponse>(
      `/authorization/resources/${resourceId}/organization_memberships`,
      {
        query: serializeListMembershipsForResourceOptions(options),
      },
    );
    return {
      object: 'list',
      data: data.data.map(deserializeOrganizationMembership),
      listMetadata: {
        before: data.list_metadata.before,
        after: data.list_metadata.after,
      },
    };
  }

  async listMembershipsForResourceByExternalId(
    options: ListMembershipsForResourceByExternalIdOptions,
  ): Promise<OrganizationMembershipList> {
    const { organizationId, resourceTypeSlug, externalId } = options;
    const { data } = await this.workos.get<OrganizationMembershipListResponse>(
      `/authorization/organizations/${organizationId}/resources/${resourceTypeSlug}/${externalId}/organization_memberships`,
      {
        query: serializeListMembershipsForResourceOptions(options),
      },
    );
    return {
      object: 'list',
      data: data.data.map(deserializeOrganizationMembership),
      listMetadata: {
        before: data.list_metadata.before,
        after: data.list_metadata.after,
      },
    };
  }
}
