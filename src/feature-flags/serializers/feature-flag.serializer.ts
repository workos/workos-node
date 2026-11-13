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
  tags: featureFlag.tags,
  enabled: featureFlag.enabled,
  defaultValue: featureFlag.default_value,
  createdAt: new Date(featureFlag.created_at),
  updatedAt: new Date(featureFlag.updated_at),
});
