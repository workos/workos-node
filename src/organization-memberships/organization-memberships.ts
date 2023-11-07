import { fetchAndDeserialize } from '../common/utils/fetch-and-deserialize';
import { AutoPaginatable } from '../common/utils/pagination';
import { WorkOS } from '../workos';
import { CreateOrganizationMembershipOptions } from './interfaces/create-organization-membership-options.interface';
import { ListOrganizationMembershipsOptions } from './interfaces/list-organization-memberships-options.interface';
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

  async listOrganizationMemberships(
    options: ListOrganizationMembershipsOptions,
  ): Promise<AutoPaginatable<OrganizationMembership>> {
    return new AutoPaginatable(
      await fetchAndDeserialize<
        OrganizationMembershipResponse,
        OrganizationMembership
      >(
        this.workos,
        '/organization_memberships',
        deserializeOrganizationMembership,
        options,
      ),
      (params) =>
        fetchAndDeserialize<
          OrganizationMembershipResponse,
          OrganizationMembership
        >(
          this.workos,
          '/organization_memberships',
          deserializeOrganizationMembership,
          params,
        ),
      options,
    );
  }

  async createOrganizationMembership(
    options: CreateOrganizationMembershipOptions,
  ): Promise<OrganizationMembership> {
    const { data } = await this.workos.post<OrganizationMembershipResponse>(
      '/organization_memberships',
      options,
    );

    return deserializeOrganizationMembership(data);
  }

  async deleteOrganizationMembership(
    organizationMembershipId: string,
  ): Promise<void> {
    await this.workos.delete(
      `/organization_memberships/${organizationMembershipId}`,
    );
  }
}
