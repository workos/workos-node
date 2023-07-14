import { WorkOS } from '../workos';
import {
  AuthenticateManagedUserOptions,
  AuthenticateUnmanagedUserOptions,
  AuthenticationResponse,
  ChallengeResponse,
  CreateEmailVerificationChallengeOptions,
  CreateUnmanagedUserOptions,
  ListUsersOptions,
  RevokeSessionOptions,
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

  async createEmailVerificationChallenge(
    payload: CreateEmailVerificationChallengeOptions,
  ): Promise<ChallengeResponse> {
    const { data } = await this.workos.post(`/users/${payload.id}/email_verification_challenge`, {
      verification_url: payload.verification_url,
    });
    return data;
  }

  async completeEmailVerification(token: string): Promise<User> {
    const { data } = await this.workos.post('/users/email_verification', {
      token,
    });
    return data;
  }
}
