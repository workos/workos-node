
import { AutoPaginatable } from '../common/utils/pagination';
import { List, ListResponse, PaginationOptions } from '../common/interfaces';
import { deserializeList } from '../common/serializers';
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

export class Organizations {
  constructor(private readonly workos: WorkOS) {}
  private setDefaultOptions(options?: PaginationOptions): PaginationOptions {
    return {
      ...options,
      order: options?.order || 'desc',
    };
  }

  private async fetchAndDeserialize<T, U>(
    endpoint: string,
    deserializeFn: (data: T) => U,
    options: PaginationOptions,
  ): Promise<List<U>> {
    const { data } = await this.workos.get<ListResponse<T>>(endpoint, {
      query: options,
    });

    return deserializeList(data, deserializeFn);
  }

  async listOrganizations(
    options?: ListOrganizationsOptions,
  ): Promise<AutoPaginatable<Organization>> {
    const defaultOptions = this.setDefaultOptions(options);

    return new AutoPaginatable(
      await this.fetchAndDeserialize<OrganizationResponse, Organization>(
        '/organizations',
        deserializeOrganization,
        defaultOptions,
      ),
      (params) =>
        this.fetchAndDeserialize<OrganizationResponse, Organization>(
          '/organizations',
          deserializeOrganization,
          params,
        ),
      defaultOptions,
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
