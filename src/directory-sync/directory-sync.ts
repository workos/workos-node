import WorkOS from '../workos';
import { Directory } from './interfaces/directory.interface';
import { List } from '../common/interfaces/list.interface';
import { Group } from './interfaces/group.interface';
import { User } from './interfaces/user.interface';
import { ListDirectoriesOptions } from './interfaces/list-directories-options.interface';
import { ListGroupsOptions } from './interfaces/list-groups-options.interface';
import { ListUsersOptions } from './interfaces/list-users-options.interface';

export class DirectorySync {
  constructor(private readonly workos: WorkOS) {}

  async listDirectories(
    options?: ListDirectoriesOptions,
  ): Promise<List<Directory>> {
    const { data } = await this.workos.get('/directories', options);
    return data;
  }

  async listGroups(options: ListGroupsOptions): Promise<List<Group>> {
    const { data } = await this.workos.get(`/directory_groups`, options);
    return data;
  }

  async listUsers(options: ListUsersOptions): Promise<List<User>> {
    const { data } = await this.workos.get(`/directory_users`, options);
    return data;
  }

  async getUser(directoryID: string, userID: string): Promise<User> {
    const { data } = await this.workos.get(
      `/directories/${directoryID}/users/${userID}`,
    );
    return data;
  }
}
