export interface CreateFlagRuleOptions {
  /** The feature flag's slug. */
  featureFlag: string;
  /** An organization, user, or registered custom target type. */
  targetType: string;
  value: boolean;
}
