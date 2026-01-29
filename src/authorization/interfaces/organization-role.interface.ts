/**
 * A role scoped to a specific organization.
 * Distinct from EnvironmentRole which applies environment-wide.
 */
export interface OrganizationRole {
  object: 'role';
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  type: 'OrganizationRole';
  createdAt: string;
  updatedAt: string;
}
