import { WorkOS } from '../workos';
import {
  AuthenticateManagedUserOptions,
  AuthenticateUnmanagedUserOptions,
  AuthenticationResponse,
  CreateUnmanagedUserOptions,
  ListUsersOptions,
  User,
  VerifySessionOptions,
  VerifySessionResponse,
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

  async authenticateUnmanagedUser(
    payload: AuthenticateUnmanagedUserOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post('/users/authentications', payload);
    return data;
  }

  async authenticateManagedUser(
    payload: AuthenticateManagedUserOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post('/users/sessions/token', payload);
    return data;
  }

  async verifySession(
    payload: VerifySessionOptions,
  ): Promise<VerifySessionResponse> {
    const { data } = await this.workos.post('/users/sessions/verify', payload);
    return data;
  }
}
