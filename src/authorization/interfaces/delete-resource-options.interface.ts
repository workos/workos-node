export interface DeleteAuthorizationResourceOptions {
  cascadeDelete?: boolean;
}

export interface DeleteResourceByExternalIdOptions {
  organizationId: string;
  resourceTypeSlug: string;
  externalId: string;
  cascadeDelete?: boolean;
}
