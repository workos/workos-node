import { serializePaginationOptions } from '../../common/serializers';
import {
  ListAuthorizationResourcesOptions,
  SerializedListAuthorizationResourcesOptions,
} from '../interfaces/list-authorization-resources-options.interface';

export const serializeListAuthorizationResourcesOptions = (
  options: ListAuthorizationResourcesOptions,
): SerializedListAuthorizationResourcesOptions => ({
  ...(options.organizationId && {
    organization_id: options.organizationId,
  }),
  ...(options.resourceTypeSlug && {
    resource_type_slug: options.resourceTypeSlug,
  }),
  ...(options.parentResourceId && {
    parent_resource_id: options.parentResourceId,
  }),
  ...(options.parentResourceTypeSlug && {
    parent_resource_type_slug: options.parentResourceTypeSlug,
  }),
  ...(options.parentExternalId && {
    parent_external_id: options.parentExternalId,
  }),
  ...(options.search && { search: options.search }),
  ...serializePaginationOptions(options),
});
