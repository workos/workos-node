import { WorkOS } from '../workos';
import {
  AgentCredentialValidation,
  AgentRegistration,
  SerializedAgentCredentialValidation,
  SerializedAgentRegistration,
  ValidateAgentCredentialOptions,
} from './interfaces';
import {
  deserializeAgentCredentialValidation,
  deserializeAgentRegistration,
  serializeValidateAgentCredentialOptions,
} from './serializers';

export class Agents {
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
   * Validate an agent credential (`api_key` or `access_token`) against the API
   * key's environment. This is a read-only check — it never consumes or mutates
   * the credential.
   * @param options - Object containing the credential type and value.
   * @returns {Promise<AgentCredentialValidation>}
   */
  async validateCredential(
    options: ValidateAgentCredentialOptions,
  ): Promise<AgentCredentialValidation> {
    const { data } =
      await this.workos.post<SerializedAgentCredentialValidation>(
        '/agents/credentials/validate',
        serializeValidateAgentCredentialOptions(options),
      );

    return deserializeAgentCredentialValidation(data);
  }
}
