import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';

import { GeneratePortalLinkIntent } from './interfaces/generate-portal-link-intent.interface';
import { ListOrganizationsOptions } from './interfaces/list-organizations-options.interface';
import { Organization } from './interfaces/organization.interface';

export class Portal {
  constructor(private readonly workos: WorkOS) {}

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

  async generateLink({
    intent,
    organization,
    returnUrl,
  }: {
    intent: GeneratePortalLinkIntent;
    organization: string;
    returnUrl?: string;
  }): Promise<string> {
    const { data } = await this.workos.post('/portal/generate_link', {
      intent,
      organization,
      return_url: returnUrl,
    });

    return data.link;
  }

  async listOrganizations(
    options?: ListOrganizationsOptions,
  ): Promise<List<Organization>> {
    const { data } = await this.workos.get('/organizations', options);

    return data;
  }
}
