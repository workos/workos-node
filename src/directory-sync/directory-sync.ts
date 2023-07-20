import { WorkOS } from '../workos';
import { List } from '../common/interfaces/list.interface';
import {
  Directory,
  Group,
  ListDirectoriesOptions,
  ListGroupsOptions,
  ListUsersOptions,
  DirectoryUserWithGroups,
} from './interfaces';
import { DefaultCustomAttributes } from './interfaces/directory_user.interface';

export class DirectorySync {
  constructor(private readonly workos: WorkOS) {}

  async listDirectories(
    options?: ListDirectoriesOptions,
  ): Promise<List<Directory>> {
    const { data } = await this.workos.get('/directories', {
      query: options,
    });
    return data;
  }

  async getDirectory(id: string): Promise<Directory> {
    const { data } = await this.workos.get(`/directories/${id}`);
    return data;
  }

  async deleteDirectory(id: string) {
    await this.workos.delete(`/directories/${id}`);
  }

  async listGroups(options: ListGroupsOptions): Promise<List<Group>> {
    const { data } = await this.workos.get(`/directory_groups`, {
      query: options,
    });
    return data;
  }

  async listUsers<TCustomAttributes extends object = DefaultCustomAttributes>(
    options: ListUsersOptions,
  ): Promise<List<DirectoryUserWithGroups<TCustomAttributes>>> {
    const { data } = await this.workos.get(`/directory_users`, {
      query: options,
    });
    return data;
  }

  async getUser<TCustomAttributes extends object = DefaultCustomAttributes>(
    user: string,
  ): Promise<DirectoryUserWithGroups<TCustomAttributes>> {
    const { data } = await this.workos.get(`/directory_users/${user}`);
    return data;
  }

  async getGroup(group: string): Promise<Group> {
    const { data } = await this.workos.get(`/directory_groups/${group}`);
    return data;
  }
}
