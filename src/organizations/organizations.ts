import { List, ListResponse } from '../common/interfaces';
import { deserializeList } from '../common/serializers';
import { WorkOS } from '../workos';
import { withDefaultOrder } from '../common/utils/default-order';
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

export class Organizations {
  constructor(private readonly workos: WorkOS) {}

  async listOrganizations(
    options?: ListOrganizationsOptions,
  ): Promise<List<Organization>> {
    const { data } = await this.workos.get<ListResponse<OrganizationResponse>>(
      '/organizations',
      {
        query: withDefaultOrder(options),
      },
    );

    return deserializeList(data, deserializeOrganization);
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
