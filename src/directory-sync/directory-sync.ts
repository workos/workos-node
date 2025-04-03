import { WorkOS } from '../workos';
import { AutoPaginatable } from '../common/utils/pagination';
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
  SerializedListDirectoriesOptions,
} from './interfaces';
import {
  deserializeDirectory,
  deserializeDirectoryGroup,
  deserializeDirectoryUserWithGroups,
  serializeListDirectoriesOptions,
} from './serializers';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';

export class DirectorySync {
  constructor(private readonly workos: WorkOS) {}

  async listDirectories(
    options?: ListDirectoriesOptions,
  ): Promise<AutoPaginatable<Directory, SerializedListDirectoriesOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<DirectoryResponse, Directory>(
        this.workos,
        '/directories',
        deserializeDirectory,
        options ? serializeListDirectoriesOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<DirectoryResponse, Directory>(
          this.workos,
          '/directories',
          deserializeDirectory,
          params,
        ),
      options ? serializeListDirectoriesOptions(options) : undefined,
    );
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
  ): Promise<AutoPaginatable<DirectoryGroup, ListDirectoryGroupsOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<DirectoryGroupResponse, DirectoryGroup>(
        this.workos,
        '/directory_groups',
        deserializeDirectoryGroup,
        options,
      ),
      (params) =>
        fetchAndDeserialize<DirectoryGroupResponse, DirectoryGroup>(
          this.workos,
          '/directory_groups',
          deserializeDirectoryGroup,
          params,
        ),
      options,
    );
  }

  async listUsers<TCustomAttributes extends object = DefaultCustomAttributes>(
    options: ListDirectoryUsersOptions,
  ): Promise<
    AutoPaginatable<
      DirectoryUserWithGroups<TCustomAttributes>,
      ListDirectoryUsersOptions
    >
  > {
    return new AutoPaginatable(
      await fetchAndDeserialize<
        DirectoryUserWithGroupsResponse<TCustomAttributes>,
        DirectoryUserWithGroups<TCustomAttributes>
      >(
        this.workos,
        '/directory_users',
        deserializeDirectoryUserWithGroups,
        options,
      ),
      (params) =>
        fetchAndDeserialize<
          DirectoryUserWithGroupsResponse<TCustomAttributes>,
          DirectoryUserWithGroups<TCustomAttributes>
        >(
          this.workos,
          '/directory_users',
          deserializeDirectoryUserWithGroups,
          params,
        ),
      options,
    );
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
