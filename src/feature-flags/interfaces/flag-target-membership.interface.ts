/** A REST target membership. The polling payload uses the separate FlagTarget type. */
export interface FlagTargetMembership {
  object: 'flag_target';
  id: string;
  ruleId: string;
  flagId: string;
  flagSlug: string;
  environmentId: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlagTargetMembershipResponse {
  object: 'flag_target';
  id: string;
  rule_id: string;
  flag_id: string;
  flag_slug: string;
  environment_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
  updated_at: string;
}

/** Returned while the team's temporary legacy target contract is enabled. */
export interface LegacyFlagTarget extends Omit<FlagTargetMembership, 'ruleId'> {
  valueType: 'boolean';
  value: boolean;
}

export interface LegacyFlagTargetResponse extends Omit<
  FlagTargetMembershipResponse,
  'rule_id'
> {
  value_type: 'boolean';
  value: boolean;
}

export type FlagTargetResource = FlagTargetMembership | LegacyFlagTarget;
export type FlagTargetResourceResponse =
  FlagTargetMembershipResponse | LegacyFlagTargetResponse;
