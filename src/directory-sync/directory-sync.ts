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
} from './interfaces';
import { List, ListResponse, PaginationOptions } from '../common/interfaces';
import {
  deserializeDirectory,
  deserializeDirectoryGroup,
  deserializeDirectoryUserWithGroups,
} from './serializers';
import { deserializeList } from '../common/serializers';

export class DirectorySync {
  constructor(private readonly workos: WorkOS) {}

  private setDefaultOptions(options?: PaginationOptions): PaginationOptions {
    return {
      ...options,
      order: options?.order || 'desc',
    };
  }

  private async fetchAndDeserialize<T, U>(
    endpoint: string,
    deserializeFn: (data: T) => U,
    options: PaginationOptions,
  ): Promise<List<U>> {
    const { data } = await this.workos.get<ListResponse<T>>(endpoint, {
      query: options,
    });

    return deserializeList(data, deserializeFn);
  }

  async listDirectories(
    options?: ListDirectoriesOptions,
  ): Promise<AutoPaginatable<Directory>> {
    const defaultOptions = this.setDefaultOptions(options);

    return new AutoPaginatable(
      await this.fetchAndDeserialize<DirectoryResponse, Directory>(
        '/directories',
        deserializeDirectory,
        defaultOptions,
      ),
      (params) =>
        this.fetchAndDeserialize<DirectoryResponse, Directory>(
          '/directories',
          deserializeDirectory,
          params,
        ),
      defaultOptions,
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
  ): Promise<List<DirectoryGroup>> {
    const defaultOptions = this.setDefaultOptions(options);

    return new AutoPaginatable(
      await this.fetchAndDeserialize<DirectoryGroupResponse, DirectoryGroup>(
        '/directory_groups',
        deserializeDirectoryGroup,
        defaultOptions,
      ),
      (params) =>
        this.fetchAndDeserialize<DirectoryGroupResponse, DirectoryGroup>(
          '/directory_groups',
          deserializeDirectoryGroup,
          params,
        ),
      defaultOptions,
    );
  }

  async listUsers<TCustomAttributes extends object = DefaultCustomAttributes>(
    options: ListDirectoryUsersOptions,
  ): Promise<List<DirectoryUserWithGroups<TCustomAttributes>>> {
    const defaultOptions = this.setDefaultOptions(options);

    return new AutoPaginatable(
      await this.fetchAndDeserialize<
        DirectoryUserWithGroupsResponse<TCustomAttributes>,
        DirectoryUserWithGroups<TCustomAttributes>
      >('/directory_users', deserializeDirectoryUserWithGroups, defaultOptions),
      (params) =>
        this.fetchAndDeserialize<
          DirectoryUserWithGroupsResponse<TCustomAttributes>,
          DirectoryUserWithGroups<TCustomAttributes>
        >('/directory_users', deserializeDirectoryUserWithGroups, params),
      defaultOptions,
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
