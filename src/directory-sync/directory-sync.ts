import { WorkOS } from '../workos';
import { withDefaultOrder } from '../common/utils/default-order';
import {
  DefaultCustomAttributes,
  Directory,
  DirectoryGroup,
  DirectoryGroupResponse,
  DirectoryResponse,
  DirectoryUserWithGroups,
  DirectoryUserWithGroupsResponse,
  ListDirectoriesOptions,
  ListDirectoryUsersOptions,
  ListGroupsOptions,
} from './interfaces';
import { DeserializedList, List } from '../common/interfaces';
import { deserializeList } from '../common/serializers';
import {
  deserializeDirectory,
  deserializeDirectoryGroup,
  deserializeDirectoryUserWithGroups,
} from './serializers';

export class DirectorySync {
  constructor(private readonly workos: WorkOS) {}

  async listDirectories(
    options?: ListDirectoriesOptions,
  ): Promise<DeserializedList<Directory>> {
    const { data } = await this.workos.get<List<DirectoryResponse>>(
      '/directories',
      {
        query: withDefaultOrder(options),
      },
    );

    return deserializeList(data, deserializeDirectory);
  }

  async getDirectory(id: string): Promise<Directory> {
    const { data } = await this.workos.get<DirectoryResponse>(
      `/directories/${id}`,
    );

    return deserializeDirectory(data);
  }

  async deleteDirectory(id: string) {
    await this.workos.delete(`/directories/${id}`);
  }

  async listGroups(
    options: ListGroupsOptions,
  ): Promise<DeserializedList<DirectoryGroup>> {
    const { data } = await this.workos.get<List<DirectoryGroupResponse>>(
      `/directory_groups`,
      {
        query: withDefaultOrder(options),
      },
    );

    return deserializeList(data, deserializeDirectoryGroup);
  }

  async listUsers<TCustomAttributes extends object = DefaultCustomAttributes>(
    options: ListDirectoryUsersOptions,
  ): Promise<DeserializedList<DirectoryUserWithGroups<TCustomAttributes>>> {
    const { data } = await this.workos.get<
      List<DirectoryUserWithGroupsResponse<TCustomAttributes>>
    >(`/directory_users`, {
      query: withDefaultOrder(options),
    });

    return deserializeList(data, deserializeDirectoryUserWithGroups);
  }

  async getUser<TCustomAttributes extends object = DefaultCustomAttributes>(
    user: string,
  ): Promise<DirectoryUserWithGroups<TCustomAttributes>> {
    const { data } = await this.workos.get<
      DirectoryUserWithGroupsResponse<TCustomAttributes>
    >(`/directory_users/${user}`);

    return deserializeDirectoryUserWithGroups(data);
  }

  async getGroup(group: string): Promise<DirectoryGroup> {
    const { data } = await this.workos.get<DirectoryGroupResponse>(
      `/directory_groups/${group}`,
    );

    return deserializeDirectoryGroup(data);
  }
}
