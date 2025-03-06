import {
  SerializedUpdateOrganizationOptions,
  UpdateOrganizationOptions,
} from '../interfaces';

export const serializeUpdateOrganizationOptions = (
  options: Omit<UpdateOrganizationOptions, 'organization'>,
): SerializedUpdateOrganizationOptions => ({
  name: options.name,
  domain_data: options.domainData,
  stripe_customer_id: options.stripeCustomerId,
  external_id: options.externalId,
  metadata: options.metadata,
});
