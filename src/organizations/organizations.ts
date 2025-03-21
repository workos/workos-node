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
import { ListOrganizationRolesResponse, RoleList } from '../roles/interfaces';
import { deserializeRole } from '../roles/serializers/role.serializer';
import { ListOrganizationRolesOptions } from './interfaces/list-organization-roles-options.interface';

export class Organizations {
  constructor(private readonly workos: WorkOS) {}

  async listOrganizations(
    options?: ListOrganizationsOptions,
  ): Promise<AutoPaginatable<Organization>> {
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

  async deleteOrganization(id: string) {
    await this.workos.delete(`/organizations/${id}`);
  }

  async getOrganization(id: string): Promise<Organization> {
    const { data } = await this.workos.get<OrganizationResponse>(
      `/organizations/${id}`,
    );

    return deserializeOrganization(data);
  }

  async getOrganizationByExternalId(externalId: string): Promise<Organization> {
    const { data } = await this.workos.get<OrganizationResponse>(
      `/organizations/external_id/${externalId}`,
    );

    return deserializeOrganization(data);
  }

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

  async listOrganizationRoles(
    options: ListOrganizationRolesOptions,
  ): Promise<RoleList> {
    const { organizationId } = options;

    const { data: response } =
      await this.workos.get<ListOrganizationRolesResponse>(
        `/organizations/${organizationId}/roles`,
      );

    return {
      object: 'list',
      data: response.data.map((role) => deserializeRole(role)),
    };
  }
}
