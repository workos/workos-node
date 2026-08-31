import { getJose } from '../utils/jose';
import { AutoPaginatable } from '../common/utils/pagination';
import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { WorkOS } from '../workos';
import {
  AgentBlueprint,
  AgentCredentialValidation,
  AgentInstance,
  AgentInstanceSession,
  AgentToken,
  CreateAgentBlueprintOptions,
  ListAgentBlueprintsOptions,
  ListAgentInstanceSessionsOptions,
  ListAgentInstancesOptions,
  MintAgentTokenOptions,
  SerializedAgentBlueprint,
  SerializedAgentInstance,
  SerializedAgentInstanceSession,
  SerializedAgentToken,
  SerializedListAgentInstanceSessionsOptions,
  SerializedListAgentInstancesOptions,
  UpdateAgentBlueprintOptions,
  AgentRegistration,
  ClaimAttemptResponse,
  LinkClaimAttemptToExternalUserOptions,
  SerializedAgentAccessTokenClaims,
  SerializedClaimAttemptResponse,
  SerializedAgentCredentialValidation,
  SerializedAgentRegistration,
  ValidateAgentAccessTokenOptions,
  ValidateAgentCredentialOptions,
} from './interfaces';
import {
  deserializeAgentAccessTokenClaims,
  deserializeAgentBlueprint,
  deserializeAgentInstance,
  deserializeAgentInstanceSession,
  deserializeAgentToken,
  serializeCreateAgentBlueprintOptions,
  serializeListAgentInstanceSessionsOptions,
  serializeListAgentInstancesOptions,
  serializeMintAgentTokenOptions,
  serializeUpdateAgentBlueprintOptions,
  deserializeAgentCredentialValidation,
  deserializeAgentRegistration,
  deserializeClaimAttemptResponse,
  serializeLinkClaimAttemptToExternalUserOptions,
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
   * Create an agent blueprint
   *
   * Creates an agent blueprint: the template describing what an agent may do
   * (its permission ceiling), who may invoke it, and the lifetimes of its
   * sessions.
   *
   * @param options - Configuration for the new agent blueprint.
   * @returns {Promise<AgentBlueprint>}
   * @throws {BadRequestException} 400
   * @throws {ConflictException} 409 - Name already in use.
   * @throws {UnprocessableEntityException} 422 - Permission, role, or organization not found.
   */
  async createBlueprint(
    options: CreateAgentBlueprintOptions,
  ): Promise<AgentBlueprint> {
    const { data } = await this.workos.post<SerializedAgentBlueprint>(
      '/agents/blueprints',
      serializeCreateAgentBlueprintOptions(options),
    );

    return deserializeAgentBlueprint(data);
  }

  /**
   * List agent blueprints
   *
   * Lists the agent blueprints in the current environment.
   *
   * @param options - Pagination options.
   * @returns {Promise<AutoPaginatable<AgentBlueprint, ListAgentBlueprintsOptions>>}
   */
  async listBlueprints(
    options?: ListAgentBlueprintsOptions,
  ): Promise<AutoPaginatable<AgentBlueprint, ListAgentBlueprintsOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<SerializedAgentBlueprint, AgentBlueprint>(
        this.workos,
        '/agents/blueprints',
        deserializeAgentBlueprint,
        options,
      ),
      (params) =>
        fetchAndDeserialize<SerializedAgentBlueprint, AgentBlueprint>(
          this.workos,
          '/agents/blueprints',
          deserializeAgentBlueprint,
          params,
        ),
      options,
    );
  }

  /**
   * Get an agent blueprint
   *
   * Retrieves an agent blueprint by ID.
   * @param agentBlueprintId - Unique identifier of the agent blueprint.
   *
   * @example
   * "agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY"
   *
   * @returns {Promise<AgentBlueprint>}
   * @throws {NotFoundException} 404
   */
  async getBlueprint(agentBlueprintId: string): Promise<AgentBlueprint> {
    const { data } = await this.workos.get<SerializedAgentBlueprint>(
      `/agents/blueprints/${encodeURIComponent(agentBlueprintId)}`,
    );

    return deserializeAgentBlueprint(data);
  }

  /**
   * Update an agent blueprint
   *
   * Updates an agent blueprint. Omitted fields are left unchanged; provided
   * lists replace the existing configuration.
   *
   * @param options - Object containing the agent blueprint ID and the fields to update.
   * @returns {Promise<AgentBlueprint>}
   * @throws {BadRequestException} 400
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409 - Name already in use.
   * @throws {UnprocessableEntityException} 422 - Permission, role, or organization not found.
   */
  async updateBlueprint(
    options: UpdateAgentBlueprintOptions,
  ): Promise<AgentBlueprint> {
    const { agentBlueprintId, ...payload } = options;

    const { data } = await this.workos.patch<SerializedAgentBlueprint>(
      `/agents/blueprints/${encodeURIComponent(agentBlueprintId)}`,
      serializeUpdateAgentBlueprintOptions(payload),
    );

    return deserializeAgentBlueprint(data);
  }

  /**
   * Delete an agent blueprint
   *
   * Deletes an agent blueprint by ID.
   * @param agentBlueprintId - Unique identifier of the agent blueprint.
   *
   * @example
   * "agent_blueprint_01EHWNCE74X7JSDV0X3SZ3KJNY"
   *
   * @returns {Promise<void>}
   * @throws {NotFoundException} 404
   */
  async deleteBlueprint(agentBlueprintId: string): Promise<void> {
    await this.workos.delete(
      `/agents/blueprints/${encodeURIComponent(agentBlueprintId)}`,
    );
  }

  /**
   * Mint an agent token
   *
   * Mints tokens for an agent session from a blueprint. Supports
   * user-delegated, autonomous, and agent-delegated mints, as well as
   * refreshing an existing session with a refresh token.
   *
   * @param options - Object containing the agent blueprint ID, the mint type, and its credentials.
   * @returns {Promise<AgentToken>}
   * @throws {BadRequestException} 400
   * @throws {NotFoundException} 404
   */
  async mintToken(options: MintAgentTokenOptions): Promise<AgentToken> {
    const { data } = await this.workos.post<SerializedAgentToken>(
      `/agents/blueprints/${encodeURIComponent(options.agentBlueprintId)}/tokens`,
      serializeMintAgentTokenOptions(options),
    );

    return deserializeAgentToken(data);
  }

  /**
   * List agent instances
   *
   * Lists the agent instances in the current environment, optionally filtered
   * by organization or agent blueprint.
   *
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<AgentInstance, SerializedListAgentInstancesOptions>>}
   */
  async listInstances(
    options?: ListAgentInstancesOptions,
  ): Promise<
    AutoPaginatable<AgentInstance, SerializedListAgentInstancesOptions>
  > {
    return new AutoPaginatable(
      await fetchAndDeserialize<SerializedAgentInstance, AgentInstance>(
        this.workos,
        '/agents/instances',
        deserializeAgentInstance,
        options ? serializeListAgentInstancesOptions(options) : undefined,
      ),
      (params) =>
        fetchAndDeserialize<SerializedAgentInstance, AgentInstance>(
          this.workos,
          '/agents/instances',
          deserializeAgentInstance,
          params,
        ),
      options ? serializeListAgentInstancesOptions(options) : undefined,
    );
  }

  /**
   * Get an agent instance
   *
   * Retrieves an agent instance by ID.
   * @param agentInstanceId - Unique identifier of the agent instance.
   *
   * @example
   * "agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY"
   *
   * @returns {Promise<AgentInstance>}
   * @throws {NotFoundException} 404
   */
  async getInstance(agentInstanceId: string): Promise<AgentInstance> {
    const { data } = await this.workos.get<SerializedAgentInstance>(
      `/agents/instances/${encodeURIComponent(agentInstanceId)}`,
    );

    return deserializeAgentInstance(data);
  }

  /**
   * Delete an agent instance
   *
   * Deletes an agent instance by ID.
   * @param agentInstanceId - Unique identifier of the agent instance.
   *
   * @example
   * "agent_instance_01EHWNCE74X7JSDV0X3SZ3KJNY"
   *
   * @returns {Promise<void>}
   * @throws {NotFoundException} 404
   */
  async deleteInstance(agentInstanceId: string): Promise<void> {
    await this.workos.delete(
      `/agents/instances/${encodeURIComponent(agentInstanceId)}`,
    );
  }

  /**
   * List agent instance sessions
   *
   * Lists the agent instance sessions in the current environment, optionally
   * filtered by agent blueprint or agent instance.
   *
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<AgentInstanceSession, SerializedListAgentInstanceSessionsOptions>>}
   */
  async listInstanceSessions(
    options?: ListAgentInstanceSessionsOptions,
  ): Promise<
    AutoPaginatable<
      AgentInstanceSession,
      SerializedListAgentInstanceSessionsOptions
    >
  > {
    return new AutoPaginatable(
      await fetchAndDeserialize<
        SerializedAgentInstanceSession,
        AgentInstanceSession
      >(
        this.workos,
        '/agents/sessions',
        deserializeAgentInstanceSession,
        options
          ? serializeListAgentInstanceSessionsOptions(options)
          : undefined,
      ),
      (params) =>
        fetchAndDeserialize<
          SerializedAgentInstanceSession,
          AgentInstanceSession
        >(
          this.workos,
          '/agents/sessions',
          deserializeAgentInstanceSession,
          params,
        ),
      options ? serializeListAgentInstanceSessionsOptions(options) : undefined,
    );
  }

  /**
   * Get an agent instance session
   *
   * Retrieves an agent instance session by ID.
   * @param agentInstanceSessionId - Unique identifier of the agent instance session.
   *
   * @example
   * "agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY"
   *
   * @returns {Promise<AgentInstanceSession>}
   * @throws {NotFoundException} 404
   */
  async getInstanceSession(
    agentInstanceSessionId: string,
  ): Promise<AgentInstanceSession> {
    const { data } = await this.workos.get<SerializedAgentInstanceSession>(
      `/agents/sessions/${encodeURIComponent(agentInstanceSessionId)}`,
    );

    return deserializeAgentInstanceSession(data);
  }

  /**
   * Revoke an agent instance session
   *
   * Revokes an agent instance session by ID, invalidating its tokens.
   * @param agentInstanceSessionId - Unique identifier of the agent instance session.
   *
   * @example
   * "agent_instance_session_01EHWNCE74X7JSDV0X3SZ3KJNY"
   *
   * @returns {Promise<AgentInstanceSession>}
   * @throws {NotFoundException} 404
   */
  async revokeInstanceSession(
    agentInstanceSessionId: string,
  ): Promise<AgentInstanceSession> {
    const { data } = await this.workos.post<SerializedAgentInstanceSession>(
      `/agents/sessions/${encodeURIComponent(agentInstanceSessionId)}/revoke`,
      {},
    );

    return deserializeAgentInstanceSession(data);
  }

  /**
   * Link a claim attempt to an external user
   *
   * Link an external user to a claim attempt and retrieve the code needed
   * for the agent to complete the claim. The user is looked up by external
   * ID; if no user exists, one is created. When the user belongs to multiple
   * organizations, an explicit organization must be provided.
   *
   * @param options - Object containing the claim attempt token, user details, and optional organization ID.
   * @returns {Promise<ClaimAttemptResponse>}
   * @throws {BadRequestException} 400 - Invalid request, email mismatch, or wrong account.
   * @throws {ForbiddenException} 403 - Claim denied or auth method disabled.
   * @throws {ConflictException} 409 - Organization selection required, external ID conflict, or already claimed.
   * @throws {GoneException} 410 - Claim or user code expired.
   */
  async linkClaimAttemptToExternalUser(
    options: LinkClaimAttemptToExternalUserOptions,
  ): Promise<ClaimAttemptResponse> {
    const { data } = await this.workos.patch<SerializedClaimAttemptResponse>(
      '/agents/claims/attempts',
      serializeLinkClaimAttemptToExternalUserOptions(options),
    );

    return deserializeClaimAttemptResponse(data);
  }

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
