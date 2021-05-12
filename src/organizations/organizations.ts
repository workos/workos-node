import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';
import {
  ListOrganizationsOptions,
  Organization,
  UpdateOrganizationOptions,
} from './interfaces';

export class Organizations {
  constructor(private readonly workos: WorkOS) {}

  async listOrganizations(
    options?: ListOrganizationsOptions,
  ): Promise<List<Organization>> {
    const { data } = await this.workos.get('/organizations', options);

    return data;
  }

  async createOrganization({
    domains,
    name,
  }: {
    domains?: string[];
    name: string;
  }): Promise<Organization> {
    const { data } = await this.workos.post('/organizations', {
      domains,
      name,
    });

    return data;
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
