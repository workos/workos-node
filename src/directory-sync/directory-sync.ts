import { WorkOS } from '../workos';
import { Autopaginatable } from '../common/utils/pagination';
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
import { List } from '../common/interfaces';
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
  ): Promise<Autopaginatable<Directory>> {
    const { data } = await this.workos.get<List<DirectoryResponse>>(
      '/directories',
      {
        query: options,
      },
    );

    const params = {
      order: options?.order ?? 'desc',
      limit: options?.limit,
    };

    data.params = params;
    return new Autopaginatable(
      deserializeList(data, deserializeDirectory),
      (params) => this.listDirectories(params),
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
    options: ListGroupsOptions,
  ): Promise<Autopaginatable<DirectoryGroup>> {
    const { data } = await this.workos.get<List<DirectoryGroupResponse>>(
      `/directory_groups`,
      {
        query: options,
      },
    );

    const params = {
      order: options?.order ?? 'desc',
      limit: options?.limit,
    };

    data.params = params;
    return new Autopaginatable(
      deserializeList(data, deserializeDirectoryGroup),
      (params) => this.listGroups(params),
    );
  }

  async listUsers<TCustomAttributes extends object = DefaultCustomAttributes>(
    options: ListDirectoryUsersOptions,
  ): Promise<Autopaginatable<DirectoryUserWithGroups<TCustomAttributes>>> {
    const { data } = await this.workos.get<
      List<DirectoryUserWithGroupsResponse<TCustomAttributes>>
    >(`/directory_users`, {
      query: options,
    });

    const params = {
      order: options?.order ?? 'desc',
      limit: options?.limit,
    };

    data.params = params;
    return new Autopaginatable(
      deserializeList(data, deserializeDirectoryUserWithGroups),
      (params) => this.listUsers(params),
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
