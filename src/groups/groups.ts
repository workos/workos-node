import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import {
  AddGroupMemberOptions,
  CreateGroupOptions,
  DeleteGroupOptions,
  GetGroupOptions,
  Group,
  GroupMember,
  GroupMemberResponse,
  GroupResponse,
  ListGroupMembersOptions,
  ListGroupsOptions,
  RemoveGroupMemberOptions,
  SerializedAddGroupMemberOptions,
  SerializedCreateGroupOptions,
  SerializedUpdateGroupOptions,
  UpdateGroupOptions,
} from './interfaces';
import {
  deserializeGroup,
  deserializeGroupMember,
  serializeAddGroupMemberOptions,
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

  async addMember(options: AddGroupMemberOptions): Promise<Group> {
    const { organizationId, groupId } = options;

    const { data } = await this.workos.post<
      GroupResponse,
      SerializedAddGroupMemberOptions
    >(
      `/organizations/${organizationId}/groups/${groupId}/organization-memberships`,
      serializeAddGroupMemberOptions(options),
    );

    return deserializeGroup(data);
  }

  async listMembers(
    options: ListGroupMembersOptions,
  ): Promise<AutoPaginatable<GroupMember>> {
    const { organizationId, groupId, ...paginationOptions } = options;
    const endpoint = `/organizations/${organizationId}/groups/${groupId}/organization-memberships`;

    return new AutoPaginatable(
      await fetchAndDeserialize<GroupMemberResponse, GroupMember>(
        this.workos,
        endpoint,
        deserializeGroupMember,
        paginationOptions,
      ),
      (params) =>
        fetchAndDeserialize<GroupMemberResponse, GroupMember>(
          this.workos,
          endpoint,
          deserializeGroupMember,
          params,
        ),
      paginationOptions,
    );
  }

  async removeMember(options: RemoveGroupMemberOptions): Promise<void> {
    const { organizationId, groupId, organizationMembershipId } = options;

    await this.workos.delete(
      `/organizations/${organizationId}/groups/${groupId}/organization-memberships/${organizationMembershipId}`,
    );
  }
}
