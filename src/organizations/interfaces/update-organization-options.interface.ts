import { UpdateOrganization } from './update-organization.interface';

// UpdateOrganizationOptions is the update request body plus the path id. After
// the resource strips `id`, the remainder is passed to serializeUpdateOrganization.
export interface UpdateOrganizationOptions extends UpdateOrganization {
  /** Unique identifier of the Organization. */
  id: string;
}
