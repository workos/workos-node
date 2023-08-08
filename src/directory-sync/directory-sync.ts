import { WorkOS } from '../workos';
import {
  DefaultCustomAttributes,
  Directory,
  DirectoryGroup,
  DirectoryGroupResponse,
  DirectoryResponse,
  DirectoryUserWithGroups,
  DirectoryUserWithGroupsResponse,
  ListDirectoriesOptions,
  ListDirectoryGroupsOptions,
  ListDirectoryUsersOptions,
} from './interfaces';
import { List, ListResponse } from '../common/interfaces';
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
  ): Promise<List<Directory>> {
    const { data } = await this.workos.get<ListResponse<DirectoryResponse>>(
      '/directories',
      {
        query: options,
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
    options: ListDirectoryGroupsOptions,
  ): Promise<List<DirectoryGroup>> {
    const { data } = await this.workos.get<
      ListResponse<DirectoryGroupResponse>
    >(`/directory_groups`, {
      query: options,
    });

    return deserializeList(data, deserializeDirectoryGroup);
  }

  async listUsers<TCustomAttributes extends object = DefaultCustomAttributes>(
    options: ListDirectoryUsersOptions,
  ): Promise<List<DirectoryUserWithGroups<TCustomAttributes>>> {
    const { data } = await this.workos.get<
      ListResponse<DirectoryUserWithGroupsResponse<TCustomAttributes>>
    >(`/directory_users`, {
      query: options,
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
