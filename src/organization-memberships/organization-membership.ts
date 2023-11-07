import { WorkOS } from '../workos';
import {
  OrganizationMembership,
  OrganizationMembershipResponse,
} from './interfaces/organization-membership.interface';
import { deserializeOrganizationMembership } from './serializers/organization-membership.serializer';

export class OrganizationMemberships {
  constructor(private readonly workos: WorkOS) {}

  async getOrganizationMembership(
    organizationMembershipId: string,
  ): Promise<OrganizationMembership> {
    const { data } = await this.workos.get<OrganizationMembershipResponse>(
      `/organization_memberships/${organizationMembershipId}`,
    );

    return deserializeOrganizationMembership(data);
  }
}
