export interface DeleteAuthorizationResourceByExternalIdOptions {
  organizationId: string;
  resourceTypeSlug: string;
  externalId: string;
  cascadeDelete?: boolean;
}
