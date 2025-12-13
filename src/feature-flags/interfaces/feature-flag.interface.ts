export interface FeatureFlag {
  object: 'feature_flag';
  id: string;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  enabled: boolean;
  defaultValue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagResponse {
  object: 'feature_flag';
  id: string;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  enabled: boolean;
  default_value: boolean;
  created_at: string;
  updated_at: string;
}
