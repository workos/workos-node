import { List } from '../common/interfaces/list.interface';
import { WorkOS } from '../workos';

import { ListOrganizationsOptions } from './interfaces/list-organizations-options.interface';
import { Organization } from './interfaces/organization.interface';

export class Portal {
  constructor(private readonly workos: WorkOS) {}

  async listOrganizations(
    options?: ListOrganizationsOptions,
  ): Promise<List<Organization>> {
    const { data } = await this.workos.get('/organizations', options);

    return data;
  }
}
