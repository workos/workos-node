import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { AutoPaginatable } from '../common/utils/pagination';
import {
  AuthorizationOrganizationMembership,
  AuthorizationOrganizationMembershipResponse,
} from '../user-management/interfaces/organization-membership.interface';
import { deserializeAuthorizationOrganizationMembership } from '../user-management/serializers/organization-membership.serializer';
import { WorkOS } from '../workos';
import {
  AddGroupOrganizationMembershipOptions,
  CreateGroupOptions,
  DeleteGroupOptions,
  GetGroupOptions,
  Group,
  GroupResponse,
  ListGroupOrganizationMembershipsOptions,
  ListGroupsOptions,
  RemoveGroupOrganizationMembershipOptions,
  SerializedAddGroupOrganizationMembershipOptions,
  SerializedCreateGroupOptions,
  SerializedUpdateGroupOptions,
  UpdateGroupOptions,
} from './interfaces';
import {
  deserializeGroup,
  serializeAddGroupOrganizationMembershipOptions,
  serializeCreateGroupOptions,
  serializeUpdateGroupOptions,
} from './serializers';

export class Groups {
  constructor(private readonly workos: WorkOS) {}

  async createGroup(options: CreateGroupOptions): Promise<Group> {
    const { organizationId } = options;

    const { data } = await this.workos.post<
      GroupResponse,
      SerializedCreateGroupOptions
    >(
      `/organizations/${organizationId}/groups`,
      serializeCreateGroupOptions(options),
    );

    return deserializeGroup(data);
  }

  async listGroups(
    options: ListGroupsOptions,
  ): Promise<AutoPaginatable<Group>> {
    const { organizationId, ...paginationOptions } = options;

    return new AutoPaginatable(
      await fetchAndDeserialize<GroupResponse, Group>(
        this.workos,
        `/organizations/${organizationId}/groups`,
        deserializeGroup,
        paginationOptions,
      ),
      (params) =>
        fetchAndDeserialize<GroupResponse, Group>(
          this.workos,
          `/organizations/${organizationId}/groups`,
          deserializeGroup,
          params,
        ),
      paginationOptions,
    );
  }

  async getGroup(options: GetGroupOptions): Promise<Group> {
    const { organizationId, groupId } = options;

    const { data } = await this.workos.get<GroupResponse>(
      `/organizations/${organizationId}/groups/${groupId}`,
    );

    return deserializeGroup(data);
  }

  async updateGroup(options: UpdateGroupOptions): Promise<Group> {
    const { organizationId, groupId, ...payload } = options;

    const { data } = await this.workos.patch<
      GroupResponse,
      SerializedUpdateGroupOptions
    >(
      `/organizations/${organizationId}/groups/${groupId}`,
      serializeUpdateGroupOptions(payload),
    );

    return deserializeGroup(data);
  }

  async deleteGroup(options: DeleteGroupOptions): Promise<void> {
    const { organizationId, groupId } = options;

    await this.workos.delete(
      `/organizations/${organizationId}/groups/${groupId}`,
    );
  }

  async addOrganizationMembership(
    options: AddGroupOrganizationMembershipOptions,
  ): Promise<Group> {
    const { organizationId, groupId } = options;

    const { data } = await this.workos.post<
      GroupResponse,
      SerializedAddGroupOrganizationMembershipOptions
    >(
      `/organizations/${organizationId}/groups/${groupId}/organization-memberships`,
      serializeAddGroupOrganizationMembershipOptions(options),
    );

    return deserializeGroup(data);
  }

  async listOrganizationMemberships(
    options: ListGroupOrganizationMembershipsOptions,
  ): Promise<AutoPaginatable<AuthorizationOrganizationMembership>> {
    const { organizationId, groupId, ...paginationOptions } = options;
    const endpoint = `/organizations/${organizationId}/groups/${groupId}/organization-memberships`;

    return new AutoPaginatable(
      await fetchAndDeserialize<
        AuthorizationOrganizationMembershipResponse,
        AuthorizationOrganizationMembership
      >(
        this.workos,
        endpoint,
        deserializeAuthorizationOrganizationMembership,
        paginationOptions,
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
      paginationOptions,
    );
  }

  async removeOrganizationMembership(
    options: RemoveGroupOrganizationMembershipOptions,
  ): Promise<void> {
    const { organizationId, groupId, organizationMembershipId } = options;

    await this.workos.delete(
      `/organizations/${organizationId}/groups/${groupId}/organization-memberships/${organizationMembershipId}`,
    );
  }
}
