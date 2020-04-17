import WorkOS from '../workos';
import { Directory } from './interfaces/directory.interface';
import { List } from '../common/interfaces/list.interface';
import { Group } from './interfaces/group.interface';
import { User } from './interfaces/user.interface';
import { ListDirectoriesOptions } from './interfaces/list-directories-options.interface';
import { PaginationOptions } from '../common/interfaces/pagination-options.interface';

export class DirectorySync {
  constructor(private readonly workos: WorkOS) {}

  async listDirectories(
    options?: ListDirectoriesOptions,
  ): Promise<List<Directory>> {
    const { data } = await this.workos.get('/directories', options);
    return data;
  }

  async listGroups(
    directoryID: string,
    options?: PaginationOptions,
  ): Promise<List<Group>> {
    const { data } = await this.workos.get(
      `/directories/${directoryID}/groups`,
      options,
    );
    return data;
  }

  async listUsers(
    directoryID: string,
    options?: PaginationOptions,
  ): Promise<List<User>> {
    const { data } = await this.workos.get(
      `/directories/${directoryID}/users`,
      options,
    );
    return data;
  }

  async listUserGroups(directoryID: string, userID: string): Promise<Group[]> {
    const { data } = await this.workos.get(
      `/directories/${directoryID}/users/${userID}/groups`,
    );
    return data;
  }

  async getUser(directoryID: string, userID: string): Promise<User> {
    const { data } = await this.workos.get(
      `/directories/${directoryID}/users/${userID}`,
    );
    return data;
  }
}
