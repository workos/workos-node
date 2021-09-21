import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';
import {
  CreateOrganizationOptions,
  ListOrganizationsOptions,
  Organization,
  UpdateOrganizationOptions,
} from './interfaces';

export class Organizations {
  constructor(private readonly workos: WorkOS) {}

  async listOrganizations(
    options?: ListOrganizationsOptions,
  ): Promise<List<Organization>> {
    const { data } = await this.workos.get('/organizations', {
      query: options,
    });

    return data;
  }

  async createOrganization(
    payload: CreateOrganizationOptions,
  ): Promise<Organization> {
    const { data } = await this.workos.post('/organizations', payload);

    return data;
  }

  async deleteOrganization(id: string) {
    await this.workos.delete(`/organizations/${id}`);
  }

  async getOrganization(id: string): Promise<Organization> {
    const { data } = await this.workos.get(`/organizations/${id}`);
    return data;
  }

  async updateOrganization(
    options: UpdateOrganizationOptions,
  ): Promise<Organization> {
    const { organization: organizationId, ...payload } = options;

    const { data } = await this.workos.put(
      `/organizations/${organizationId}`,
      payload,
    );

    return data;
  }
}
