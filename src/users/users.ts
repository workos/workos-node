import { WorkOS } from '../workos';
import {
  AddUserToOrganizationOptions,
  AuthenticateUserWithPasswordOptions,
  AuthenticateUserWithTokenOptions,
  AuthenticationResponse,
  AuthenticationResponseResponse,
  CompletePasswordResetOptions,
  CreateEmailVerificationChallengeOptions,
  CreateEmailVerificationChallengeResponse,
  CreateEmailVerificationChallengeResponseResponse,
  CreatePasswordResetChallengeOptions,
  CreatePasswordResetChallengeResponse,
  CreatePasswordResetChallengeResponseResponse,
  CreateUserOptions,
  ListUsersOptions,
  RemoveUserFromOrganizationOptions,
  RevokeSessionOptions,
  SerializedAddUserToOrganizationOptions,
  SerializedAuthenticateUserWithPasswordOptions,
  SerializedAuthenticateUserWithTokenOptions,
  SerializedCompletePasswordResetOptions,
  SerializedCreateEmailVerificationChallengeOptions,
  SerializedCreatePasswordResetChallengeOptions,
  SerializedCreateUserOptions,
  SerializedRevokeSessionOptions,
  SerializedUpdateUserPasswordOptions,
  SerializedVerifySessionOptions,
  UpdateUserPasswordOptions,
  User,
  UserResponse,
  VerifySessionOptions,
  VerifySessionResponse,
  VerifySessionResponseResponse,
} from './interfaces';
import { DeserializedList, List } from '../common/interfaces';
import {
  deserializeAuthenticationResponse,
  deserializeCreateEmailVerificationChallengeResponse,
  deserializeCreatePasswordResetChallengeResponse,
  deserializeUser,
  deserializeVerifySessionResponse,
  serializeAuthenticateUserWithPasswordOptions,
  serializeAuthenticateUserWithTokenOptions,
  serializeCompletePasswordResetOptions,
  serializeCreatePasswordResetChallengeOptions,
  serializeCreateUserOptions,
  serializeRevokeSessionOptions,
  serializeUpdateUserPasswordOptions,
  serializeVerifySessionOptions,
} from './serializers';
import { deserializeList } from '../common/serializers';

export class Users {
  constructor(private readonly workos: WorkOS) {}

  async getUser(userId: string): Promise<User> {
    const { data } = await this.workos.get<UserResponse>(`/users/${userId}`);

    return deserializeUser(data);
  }

  async listUsers(options?: ListUsersOptions): Promise<DeserializedList<User>> {
    const { data } = await this.workos.get<List<UserResponse>>('/users', {
      query: options,
    });

    return deserializeList(data, deserializeUser);
  }

  async createUser(payload: CreateUserOptions): Promise<User> {
    const { data } = await this.workos.post<
      UserResponse,
      any,
      SerializedCreateUserOptions
    >('/users', serializeCreateUserOptions(payload));

    return deserializeUser(data);
  }

  async authenticateUserWithPassword(
    payload: AuthenticateUserWithPasswordOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      any,
      SerializedAuthenticateUserWithPasswordOptions
    >(
      '/users/sessions/token',
      serializeAuthenticateUserWithPasswordOptions({
        ...payload,
        clientSecret: this.workos.key,
      }),
    );

    return deserializeAuthenticationResponse(data);
  }

  async authenticateUserWithToken(
    payload: AuthenticateUserWithTokenOptions,
  ): Promise<AuthenticationResponse> {
    const { data } = await this.workos.post<
      AuthenticationResponseResponse,
      any,
      SerializedAuthenticateUserWithTokenOptions
    >(
      '/users/sessions/token',
      serializeAuthenticateUserWithTokenOptions({
        ...payload,
        clientSecret: this.workos.key,
      }),
    );

    return deserializeAuthenticationResponse(data);
  }

  async verifySession(
    payload: VerifySessionOptions,
  ): Promise<VerifySessionResponse> {
    const { data } = await this.workos.post<
      VerifySessionResponseResponse,
      any,
      SerializedVerifySessionOptions
    >('/users/sessions/verify', serializeVerifySessionOptions(payload));

    return deserializeVerifySessionResponse(data);
  }

  async revokeSession(payload: RevokeSessionOptions): Promise<boolean> {
    const { data } = await this.workos.post<
      boolean,
      any,
      SerializedRevokeSessionOptions
    >('/users/sessions/revocations', serializeRevokeSessionOptions(payload));

    return data;
  }

  async revokeAllSessionsForUser(userId: string): Promise<boolean> {
    const { data } = await this.workos.delete(`/users/${userId}/sessions`);

    return data;
  }

  async createEmailVerificationChallenge({
    userId,
    verificationUrl,
  }: CreateEmailVerificationChallengeOptions): Promise<CreateEmailVerificationChallengeResponse> {
    const { data } = await this.workos.post<
      CreateEmailVerificationChallengeResponseResponse,
      any,
      SerializedCreateEmailVerificationChallengeOptions
    >(`/users/${userId}/email_verification_challenge`, {
      verification_url: verificationUrl,
    });

    return deserializeCreateEmailVerificationChallengeResponse(data);
  }

  async completeEmailVerification(token: string): Promise<User> {
    const { data } = await this.workos.post<UserResponse>(
      '/users/email_verification',
      {
        token,
      },
    );

    return deserializeUser(data);
  }

  async createPasswordResetChallenge(
    payload: CreatePasswordResetChallengeOptions,
  ): Promise<CreatePasswordResetChallengeResponse> {
    const { data } = await this.workos.post<
      CreatePasswordResetChallengeResponseResponse,
      any,
      SerializedCreatePasswordResetChallengeOptions
    >(
      '/users/password_reset_challenge',
      serializeCreatePasswordResetChallengeOptions(payload),
    );

    return deserializeCreatePasswordResetChallengeResponse(data);
  }

  async completePasswordReset(
    payload: CompletePasswordResetOptions,
  ): Promise<User> {
    const { data } = await this.workos.post<
      UserResponse,
      any,
      SerializedCompletePasswordResetOptions
    >('/users/password_reset', serializeCompletePasswordResetOptions(payload));

    return deserializeUser(data);
  }

  async addUserToOrganization({
    userId,
    organizationId,
  }: AddUserToOrganizationOptions): Promise<User> {
    const { data } = await this.workos.post<
      UserResponse,
      any,
      SerializedAddUserToOrganizationOptions
    >(`/users/${userId}/organizations`, {
      organization_id: organizationId,
    });

    return deserializeUser(data);
  }

  async removeUserFromOrganization({
    userId,
    organizationId,
  }: RemoveUserFromOrganizationOptions): Promise<User> {
    const { data } = await this.workos.delete<UserResponse>(
      `/users/${userId}/organizations/${organizationId}`,
    );

    return deserializeUser(data);
  }

  async updateUserPassword(payload: UpdateUserPasswordOptions): Promise<User> {
    const { data } = await this.workos.put<
      UserResponse,
      SerializedUpdateUserPasswordOptions
    >(
      `/users/${payload.userId}/password`,
      serializeUpdateUserPasswordOptions(payload),
    );

    return deserializeUser(data);
  }
}
