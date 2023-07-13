import { WorkOS } from '../workos';
import {
  CreateUnmanagedUserOptions,
  ListUsersOptions,
  User,
} from './interfaces';
import { List } from '../common/interfaces/list.interface';

export class UserManagement {
  constructor(private readonly workos: WorkOS) {}

  async getUser(userId: string): Promise<User> {
    const { data } = await this.workos.get(`/users/${userId}`);
    return data;
  }

  async listUsers(options?: ListUsersOptions): Promise<List<User>> {
    const { data } = await this.workos.get('/users', {
      query: options,
    });
    return data;
  }

  async createUnmanagedUser(
    payload: CreateUnmanagedUserOptions,
  ): Promise<User> {
    const { data } = await this.workos.post('/users', payload);

    return data;
  }
}
