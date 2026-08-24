import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import { List, ListResponse } from '../common/interfaces';
import {
  CreateItContactOptions,
  CreateOrganizationOptions,
  CreateOrganizationRequestOptions,
  DeleteItContactOptions,
  InviteItContactOptions,
  ItContact,
  ItContactResponse,
  ListItContactsOptions,
  ListOrganizationsOptions,
  Organization,
  OrganizationResponse,
  RevokeItContactOptions,
  UpdateOrganizationOptions,
} from './interfaces';
import {
  deserializeItContact,
  deserializeOrganization,
  serializeCreateItContactOptions,
  serializeCreateOrganizationOptions,
  serializeInviteItContactOptions,
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
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
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
   *
   * @example
   * "org_01EHZNVPK3SFK441A1RGBFSHRT"
   *
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
   *
   * @example
   * "2fe01467-f7ea-4dd2-8b79-c2b4f56d0191"
   *
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

  /**
   * List IT Contacts
   *
   * Get the IT Contacts for an Organization.
   * @param options - Object containing the Organization ID.
   * @returns {Promise<List<ItContact>>}
   * @throws {AuthorizationException} 403
   * @throws {NotFoundException} 404
   */
  async listItContacts(
    options: ListItContactsOptions,
  ): Promise<List<ItContact>> {
    const { organizationId } = options;

    const { data } = await this.workos.get<ListResponse<ItContactResponse>>(
      `/organizations/${organizationId}/it_contacts`,
    );

    return {
      object: data.object,
      data: data.data.map(deserializeItContact),
      listMetadata: {
        before: data.list_metadata.before,
        after: data.list_metadata.after,
      },
    };
  }

  /**
   * Create an IT Contact
   *
   * Add an IT Contact to an Organization. No Admin Portal invitation is sent,
   * though the contact is notified if the Organization has a connection
   * certificate nearing expiry.
   * @param options - Object containing the Organization ID and the email address.
   * @returns {Promise<ItContact>}
   * @throws {AuthorizationException} 403
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
  async createItContact(options: CreateItContactOptions): Promise<ItContact> {
    const { organizationId, ...payload } = options;

    const { data } = await this.workos.post<ItContactResponse>(
      `/organizations/${organizationId}/it_contacts`,
      serializeCreateItContactOptions(payload),
    );

    return deserializeItContact(data);
  }

  /**
   * Delete an IT Contact
   *
   * Remove an IT Contact from an Organization and revoke the contact's active
   * setup links.
   * @param options - Object containing the Organization ID and the IT Contact ID.
   * @returns {Promise<void>}
   * @throws {AuthorizationException} 403
   * @throws {NotFoundException} 404
   */
  async deleteItContact(options: DeleteItContactOptions): Promise<void> {
    const { organizationId, contactId } = options;

    await this.workos.delete(
      `/organizations/${organizationId}/it_contacts/${contactId}`,
    );
  }

  /**
   * Invite an IT Contact
   *
   * Create an Admin Portal setup link and email it to the IT Contact. An
   * Organization can have at most one active invitation.
   * @param options - Object containing the Organization ID, the IT Contact ID and the intents.
   * @returns {Promise<void>}
   * @throws {AuthorizationException} 403
   * @throws {NotFoundException} 404
   * @throws {ConflictException} 409
   * @throws {UnprocessableEntityException} 422
   */
  async inviteItContact(options: InviteItContactOptions): Promise<void> {
    const { organizationId, contactId, ...payload } = options;

    await this.workos.post(
      `/organizations/${organizationId}/it_contacts/${contactId}/invite`,
      serializeInviteItContactOptions(payload),
    );
  }

  /**
   * Revoke an IT Contact's invitation
   *
   * Revoke the Organization's active Admin Portal invitation.
   * @param options - Object containing the Organization ID and the IT Contact ID.
   * @returns {Promise<void>}
   * @throws {AuthorizationException} 403
   * @throws {NotFoundException} 404
   */
  async revokeItContact(options: RevokeItContactOptions): Promise<void> {
    const { organizationId, contactId } = options;

    await this.workos.post(
      `/organizations/${organizationId}/it_contacts/${contactId}/revoke`,
      {},
    );
  }
}
