export interface OrganizationRole {
  object: 'role';
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  resourceTypeSlug: string;
  type: 'OrganizationRole';
  createdAt: string;
  updatedAt: string;
}
