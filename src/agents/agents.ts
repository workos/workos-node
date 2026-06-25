import { getJose } from '../utils/jose';
import { WorkOS } from '../workos';
import {
  AgentCredentialValidation,
  AgentRegistration,
  SerializedAgentAccessTokenClaims,
  SerializedAgentCredentialValidation,
  SerializedAgentRegistration,
  ValidateAgentAccessTokenOptions,
  ValidateAgentCredentialOptions,
} from './interfaces';
import {
  deserializeAgentAccessTokenClaims,
  deserializeAgentCredentialValidation,
  deserializeAgentRegistration,
  serializeValidateAgentCredentialOptions,
} from './serializers';

export class Agents {
  private _jwks?: ReturnType<typeof import('jose').createRemoteJWKSet>;

  constructor(private readonly workos: WorkOS) {}

  /**
   * Get an agent registration
   *
   * Retrieve a single agent registration scoped to the API key's environment.
   * @param id - Unique identifier of the agent registration.
   *
   * @example
   * "agent_registration_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @returns {Promise<AgentRegistration>}
   * @throws {NotFoundException} 404
   */
  async getRegistration(id: string): Promise<AgentRegistration> {
    const { data } = await this.workos.get<SerializedAgentRegistration>(
      `/agents/registrations/${id}`,
    );

    return deserializeAgentRegistration(data);
  }

  /**
   * Validate an agent credential
   *
   * For `access_token` credentials, the token is decoded and verified locally
   * against the environment's JWKS and its claims are returned — no network
   * request is made unless `checkForRevoked` is set, in which case the WorkOS
   * API is also called to confirm the token has not been revoked.
   *
   * For `api_key` credentials, the WorkOS API is always called to validate the
   * key against the environment.
   *
   * @param options - Object containing the credential type and value.
   * @returns {Promise<AgentCredentialValidation>}
   */
  async validateCredential(
    options: ValidateAgentCredentialOptions,
  ): Promise<AgentCredentialValidation> {
    if (options.type === 'access_token') {
      return this.validateAccessToken(options);
    }

    return this.validateCredentialRemotely(options);
  }

  private async validateAccessToken(
    options: ValidateAgentAccessTokenOptions,
  ): Promise<AgentCredentialValidation> {
    const claims = await this.verifyAccessTokenClaims(options.credential);

    if (!claims) {
      return {
        valid: false,
        registrationId: null,
        expiresAt: null,
        claims: null,
      };
    }

    // The signature and time claims check out locally. Unless the caller wants
    // a revocation check, that's the whole verdict — a revoked but unexpired
    // token still reports valid here.
    if (!options.checkForRevoked) {
      return {
        valid: true,
        registrationId: claims.registrationId,
        expiresAt:
          claims.expiresAt != null
            ? new Date(claims.expiresAt * 1000).toISOString()
            : null,
        claims,
      };
    }

    // Confirm against the server that the token has not been revoked. The
    // server is the source of truth for revocation and expiry, but the locally
    // decoded claims are still surfaced.
    const remote = await this.validateCredentialRemotely(options);
    return { ...remote, claims: remote.valid ? claims : null };
  }

  private async validateCredentialRemotely(
    options: ValidateAgentCredentialOptions,
  ): Promise<AgentCredentialValidation> {
    const { data } =
      await this.workos.post<SerializedAgentCredentialValidation>(
        '/agents/credentials/validate',
        serializeValidateAgentCredentialOptions(options),
      );

    return deserializeAgentCredentialValidation(data);
  }

  /**
   * Verifies an access token's signature and time claims against the
   * environment's JWKS and returns its decoded claims, or `null` when the token
   * is invalid (bad signature, expired, malformed). Errors that are not JWT
   * validation failures (e.g. network errors fetching the JWKS) propagate.
   */
  private async verifyAccessTokenClaims(credential: string) {
    const { jwtVerify } = await getJose();
    const jwks = await this.getJWKS();

    try {
      const { payload } = await jwtVerify<SerializedAgentAccessTokenClaims>(
        credential,
        jwks,
      );
      return deserializeAgentAccessTokenClaims(payload);
    } catch (e) {
      if (
        e instanceof Error &&
        'code' in e &&
        typeof e.code === 'string' &&
        (e.code.startsWith('ERR_JWT_') || e.code.startsWith('ERR_JWS_'))
      ) {
        return null;
      }
      throw e;
    }
  }

  private async getJWKS(): Promise<
    ReturnType<typeof import('jose').createRemoteJWKSet>
  > {
    const { clientId } = this.workos;
    if (!clientId) {
      throw new Error(
        'Missing client ID. Did you provide it when initializing WorkOS?',
      );
    }

    const { createRemoteJWKSet } = await getJose();
    this._jwks ??= createRemoteJWKSet(
      new URL(`${this.workos.baseURL}/sso/jwks/${clientId}`),
      { cooldownDuration: 1000 * 60 * 5 },
    );

    return this._jwks;
  }
}
