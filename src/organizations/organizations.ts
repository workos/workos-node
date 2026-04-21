import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import {
  CreateOrganizationOptions,
  CreateOrganizationRequestOptions,
  ListOrganizationsOptions,
  Organization,
  OrganizationResponse,
  UpdateOrganizationOptions,
} from './interfaces';
import {
  deserializeOrganization,
  serializeCreateOrganizationOptions,
  serializeUpdateOrganizationOptions,
} from './serializers';

import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';

export class Organizations {
  constructor(private readonly workos: WorkOS) {}

  /**
   * List Organizations
   *
   * Get a list of all of your existing organizations matching the criteria specified.
   * @param options - Pagination and filter options.
   * @returns {Promise<AutoPaginatable<Organization, ListOrganizationsOptions>>}
   * @throws {UnprocessableEntityException} 422
   */
  async listOrganizations(
    options?: ListOrganizationsOptions,
  ): Promise<AutoPaginatable<Organization, ListOrganizationsOptions>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<OrganizationResponse, Organization>(
        this.workos,
        '/organizations',
        deserializeOrganization,
        options,
      ),
      (params) =>
        fetchAndDeserialize<OrganizationResponse, Organization>(
          this.workos,
          '/organizations',
          deserializeOrganization,
          params,
        ),
      options,
    );
  }

  /**
   * Create an Organization
   *
   * Creates a new organization in the current environment.
   * @param payload - Object containing name.
   * @returns {Promise<Organization>}
   * @throws {BadRequestException} 400
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
  async createOrganization(
    payload: CreateOrganizationOptions,
    requestOptions: CreateOrganizationRequestOptions = {},
  ): Promise<Organization> {
    const { data } = await this.workos.post<OrganizationResponse>(
      '/organizations',
      serializeCreateOrganizationOptions(payload),
      requestOptions,
    );

    return deserializeOrganization(data);
  }

  /**
   * Delete an Organization
   *
   * Permanently deletes an organization in the current environment. It cannot be undone.
   * @param id - Unique identifier of the Organization.
   * @example "org_01EHZNVPK3SFK441A1RGBFSHRT"
   * @returns {Promise<void>}
   * @throws 403 response from the API.
   */
  async deleteOrganization(id: string) {
    await this.workos.delete(`/organizations/${id}`);
  }

  /**
   * Get an Organization
   *
   * Get the details of an existing organization.
   * @param id - Unique identifier of the Organization.
   * @example "org_01EHZNVPK3SFK441A1RGBFSHRT"
   * @returns {Promise<Organization>}
   * @throws {NotFoundException} 404
   */
  async getOrganization(id: string): Promise<Organization> {
    const { data } = await this.workos.get<OrganizationResponse>(
      `/organizations/${id}`,
    );

    return deserializeOrganization(data);
  }

  /**
   * Get an Organization by External ID
   *
   * Get the details of an existing organization by an [external identifier](https://workos.com/docs/authkit/metadata/external-identifiers).
   * @param externalId - The external ID of the Organization.
   * @example "2fe01467-f7ea-4dd2-8b79-c2b4f56d0191"
   * @returns {Promise<Organization>}
   * @throws {NotFoundException} 404
   */
  async getOrganizationByExternalId(externalId: string): Promise<Organization> {
    const { data } = await this.workos.get<OrganizationResponse>(
      `/organizations/external_id/${externalId}`,
    );

    return deserializeOrganization(data);
  }

  /**
   * Update an Organization
   *
   * Updates an organization in the current environment.
   * @param payload - The request body.
   * @returns {Promise<Organization>}
   * @throws {BadRequestException} 400
   * @throws 403 response from the API.
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
  async updateOrganization(
    options: UpdateOrganizationOptions,
  ): Promise<Organization> {
    const { organization: organizationId, ...payload } = options;

    const { data } = await this.workos.put<OrganizationResponse>(
      `/organizations/${organizationId}`,
      serializeUpdateOrganizationOptions(payload),
    );

    return deserializeOrganization(data);
  }
}
