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

/**
 * A decoded JWT payload is only an agent credential if it carries every claim
 * the SDK guarantees. A token signed by the same JWKS for another purpose
 * (e.g. a user session) lacks these and is rejected rather than reported valid
 * with empty identifiers.
 */
function hasRequiredAgentClaims(
  payload: import('jose').JWTPayload,
): payload is SerializedAgentAccessTokenClaims {
  return (
    typeof payload.iss === 'string' &&
    (typeof payload.aud === 'string' || Array.isArray(payload.aud)) &&
    typeof payload.sub === 'string' &&
    typeof payload.jti === 'string' &&
    typeof payload.org_id === 'string' &&
    typeof payload.exp === 'number' &&
    typeof payload.iat === 'number'
  );
}

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
   * "agent_reg_01EHZNVPK3SFK441A1RGBFSHRT"
   *
   * @returns {Promise<AgentRegistration>}
   * @throws {NotFoundException} 404
   */
  async getRegistration(id: string): Promise<AgentRegistration> {
    const { data } = await this.workos.get<SerializedAgentRegistration>(
      `/agents/registrations/${encodeURIComponent(id)}`,
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
    const claims = await this.verifyAccessTokenClaims(
      options.credential,
      options.audience,
    );

    if (!claims) {
      return {
        valid: false,
        registrationId: null,
        expiresAt: null,
        claims: null,
      };
    }

    // The signature, audience, and time claims check out locally. Unless the
    // caller wants a revocation check, that's the whole verdict — a revoked but
    // unexpired token still reports valid here.
    if (!options.checkForRevoked) {
      return {
        valid: true,
        registrationId: claims.registrationId,
        expiresAt: new Date(claims.expiresAt * 1000).toISOString(),
        claims,
      };
    }

    // Confirm against the server that the token has not been revoked. The
    // server is the source of truth for revocation and expiry, but the locally
    // decoded claims are still surfaced.
    const remote = await this.validateCredentialRemotely(options);

    if (!remote.valid) {
      return remote;
    }

    // Defense in depth: the server should always agree with the token's own
    // identity. If it doesn't, treat the credential as invalid rather than
    // returning two conflicting registration identities in one result.
    if (remote.registrationId !== claims.registrationId) {
      return {
        valid: false,
        registrationId: null,
        expiresAt: null,
        claims: null,
      };
    }

    return { ...remote, claims };
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
   * Verifies an access token's signature, audience, and time claims against the
   * environment's JWKS and returns its decoded claims, or `null` when the token
   * is invalid (bad signature, wrong audience, expired, malformed, or missing
   * the agent identity claims). Errors that are not JWT validation failures
   * (e.g. network errors fetching the JWKS) propagate.
   *
   * The audience defaults to the client ID; resource-scoped tokens carry the
   * resource as their audience and require it to be passed explicitly.
   */
  private async verifyAccessTokenClaims(credential: string, audience?: string) {
    const { jwtVerify } = await getJose();
    // Throws when no client ID is configured, so `this.workos.clientId` below
    // is guaranteed to be present as the default audience.
    const jwks = await this.getJWKS();

    try {
      const { payload } = await jwtVerify(credential, jwks, {
        audience: audience ?? this.workos.clientId,
      });

      if (!hasRequiredAgentClaims(payload)) {
        return null;
      }

      // Defense in depth: jose already rejects an expired token when `exp` is
      // present, but enforce it explicitly so a past expiry is never accepted.
      if (payload.exp * 1000 <= Date.now()) {
        return null;
      }

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
