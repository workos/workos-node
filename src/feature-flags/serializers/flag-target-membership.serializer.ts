import {
  FlagTargetMembership,
  FlagTargetMembershipResponse,
  FlagTargetResource,
  FlagTargetResourceResponse,
} from '../interfaces';

const deserializeTargetFields = (target: FlagTargetResourceResponse) => ({
  object: target.object,
  id: target.id,
  flagId: target.flag_id,
  flagSlug: target.flag_slug,
  environmentId: target.environment_id,
  targetType: target.target_type,
  targetId: target.target_id,
  createdAt: target.created_at,
  updatedAt: target.updated_at,
});

export const deserializeFlagTargetMembership = (
  target: FlagTargetMembershipResponse,
): FlagTargetMembership => ({
  ...deserializeTargetFields(target),
  ruleId: target.rule_id,
});

export const deserializeFlagTargetResource = (
  target: FlagTargetResourceResponse,
): FlagTargetResource =>
  'rule_id' in target
    ? deserializeFlagTargetMembership(target)
    : {
        ...deserializeTargetFields(target),
        valueType: target.value_type,
        value: target.value,
      };
