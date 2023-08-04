import { WorkOS } from '../workos';
import {
  AddUserToOrganizationOptions,
  AuthenticateUserWithPasswordOptions,
  AuthenticateUserWithTokenOptions,
  AuthenticationResponse,
  CompletePasswordResetOptions,
  CreateEmailVerificationChallengeOptions,
  CreateEmailVerificationChallengeResponse,
  CreatePasswordResetChallengeOptions,
  CreatePasswordResetChallengeResponse,
  CreateUserOptions,
  ListUsersOptions,
  RemoveUserFromOrganizationOptions,
  RevokeSessionOptions,
  User,
  VerifySessionOptions,
  VerifySessionResponse,
} from './interfaces';
import { List } from '../common/interfaces/list.interface';

export class Users {
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

  async createUser(payload: CreateUserOptions): Promise<User> {
    const { data } = await this.workos.post('/users', payload);

    return data;
  }

  async authenticateUserWithPassword(
    payload: AuthenticateUserWithPasswordOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post('/users/sessions/token', {
      ...payload,
      client_secret: this.workos.key,
      grant_type: 'password',
    });
    return data;
  }

  async authenticateUserWithToken(
    payload: AuthenticateUserWithTokenOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post('/users/sessions/token', {
      ...payload,
      client_secret: this.workos.key,
      grant_type: 'authorization_code',
    });
    return data;
  }

  async verifySession(
    payload: VerifySessionOptions,
  ): Promise<VerifySessionResponse> {
    const { data } = await this.workos.post('/users/sessions/verify', payload);
    return data;
  }

  async revokeSession(payload: RevokeSessionOptions): Promise<boolean> {
    const { data } = await this.workos.post(
      '/users/sessions/revocations',
      payload,
    );
    return data;
  }

  async revokeAllSessionsForUser(userId: string): Promise<boolean> {
    const { data } = await this.workos.delete(`/users/${userId}/sessions`);
    return data;
  }

  async createEmailVerificationChallenge({
    user_id,
    verification_url,
  }: CreateEmailVerificationChallengeOptions): Promise<CreateEmailVerificationChallengeResponse> {
    const { data } = await this.workos.post(
      `/users/${user_id}/email_verification_challenge`,
      {
        verification_url,
      },
    );
    return data;
  }

  async completeEmailVerification(token: string): Promise<User> {
    const { data } = await this.workos.post('/users/email_verification', {
      token,
    });
    return data;
  }

  async createPasswordResetChallenge(
    payload: CreatePasswordResetChallengeOptions,
  ): Promise<CreatePasswordResetChallengeResponse> {
    const { data } = await this.workos.post(
      '/users/password_reset_challenge',
      payload,
    );
    return data;
  }

  async completePasswordReset(
    payload: CompletePasswordResetOptions,
  ): Promise<User> {
    const { data } = await this.workos.post('/users/password_reset', payload);
    return data;
  }

  async addUserToOrganization({
    user_id,
    organization_id,
  }: AddUserToOrganizationOptions): Promise<User> {
    const { data } = await this.workos.post(`/users/${user_id}/organizations`, {
      organization_id,
    });
    return data;
  }

  async removeUserFromOrganization({
    user_id,
    organization_id,
  }: RemoveUserFromOrganizationOptions): Promise<User> {
    const { data } = await this.workos.delete(
      `/users/${user_id}/organizations/${organization_id}`,
    );
    return data;
  }
}
