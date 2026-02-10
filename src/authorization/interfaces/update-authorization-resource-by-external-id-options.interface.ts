export interface UpdateAuthorizationResourceByExternalIdOptions {
  organizationId: string;
  resourceTypeSlug: string;
  externalId: string;
  name?: string;
  description?: string | null;
}
