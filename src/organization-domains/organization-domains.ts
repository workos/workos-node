import { WorkOS } from '../workos';
import {
  CreateOrganizationDomainOptions,
  OrganizationDomain,
  OrganizationDomainResponse,
} from './interfaces';
import { serializeCreateOrganizationDomainOptions } from './serializers/create-organization-domain-options.serializer';
import { deserializeOrganizationDomain } from './serializers/organization-domain.serializer';

export class OrganizationDomains {
  constructor(private readonly workos: WorkOS) {}

  /**
   * Get an Organization Domain
   *
   * Get the details of an existing organization domain.
   * @param id - Unique identifier of the organization domain.
   *
   * @example
   * "org_domain_01EHZNVPK2QXHMVWCEDQEKY69A"
   *
   * @returns {Promise<OrganizationDomain>}
   * @throws {NotFoundException} 404
   */
  async getOrganizationDomain(id: string): Promise<OrganizationDomain> {
    const { data } = await this.workos.get<OrganizationDomainResponse>(
      `/organization_domains/${id}`,
    );

    return deserializeOrganizationDomain(data);
  }

  /**
   * Verify an Organization Domain
   *
   * Initiates verification process for an Organization Domain.
   * @param id - Unique identifier of the organization domain.
   *
   * @example
   * "org_domain_01EHZNVPK2QXHMVWCEDQEKY69A"
   *
   * @returns {Promise<OrganizationDomain>}
   * @throws {BadRequestException} 400
   */
  async verifyOrganizationDomain(id: string): Promise<OrganizationDomain> {
    const { data } = await this.workos.post<OrganizationDomainResponse>(
      `/organization_domains/${id}/verify`,
      {},
    );

    return deserializeOrganizationDomain(data);
  }

  /**
   * Create an Organization Domain
   *
   * Creates a new Organization Domain.
   * @param payload - Object containing domain, organizationId.
   * @returns {Promise<OrganizationDomain>}
   * @throws {ConflictException} 409
   */
  async createOrganizationDomain(
    payload: CreateOrganizationDomainOptions,
  ): Promise<OrganizationDomain> {
    const { data } = await this.workos.post<OrganizationDomainResponse>(
      `/organization_domains`,
      serializeCreateOrganizationDomainOptions(payload),
    );

    return deserializeOrganizationDomain(data);
  }

  /**
   * Delete an Organization Domain
   *
   * Permanently deletes an organization domain. It cannot be undone.
   * @param id - Unique identifier of the organization domain.
   *
   * @example
   * "org_domain_01EHZNVPK2QXHMVWCEDQEKY69A"
   *
   * @returns {Promise<void>}
   * @throws {NotFoundException} 404
   */
  async deleteOrganizationDomain(id: string): Promise<void> {
    await this.workos.delete(`/organization_domains/${id}`);
  }
}
