import {
  FlagTargetMembership,
  FlagTargetMembershipResponse,
} from '../interfaces';

export const deserializeFlagTargetMembership = (
  target: FlagTargetMembershipResponse,
): FlagTargetMembership => ({
  object: target.object,
  id: target.id,
  ruleId: target.rule_id,
  flagId: target.flag_id,
  flagSlug: target.flag_slug,
  environmentId: target.environment_id,
  targetType: target.target_type,
  targetId: target.target_id,
  createdAt: target.created_at,
  updatedAt: target.updated_at,
});
