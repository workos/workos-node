import {
  FeatureFlag,
  FeatureFlagResponse,
} from '../interfaces/feature-flag.interface';

export const deserializeFeatureFlag = (
  featureFlag: FeatureFlagResponse,
): FeatureFlag => ({
  object: featureFlag.object,
  id: featureFlag.id,
  name: featureFlag.name,
  slug: featureFlag.slug,
  description: featureFlag.description,
  createdAt: featureFlag.created_at,
  updatedAt: featureFlag.updated_at,
});
