import { WorkOS } from '../workos';
import {
  AuthenticateManagedUserOptions,
  AuthenticateUnmanagedUserOptions,
  AuthenticationResponse,
  ChallengeResponse,
  CompletePasswordResetOptions,
  CreateEmailVerificationChallengeOptions,
  CreatePasswordResetChallengeOptions,
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

  // TODO: figure out if i need to do something to make the idempotency key work?
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

  async createPasswordResetChallenge(
    payload: CreatePasswordResetChallengeOptions,
  ): Promise<ChallengeResponse> {
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
}
