import { FlagRule, FlagRuleResponse } from '../interfaces';

export const deserializeFlagRule = (rule: FlagRuleResponse): FlagRule => ({
  object: rule.object,
  id: rule.id,
  flagId: rule.flag_id,
  flagSlug: rule.flag_slug,
  environmentId: rule.environment_id,
  targetType: rule.target_type,
  position: rule.position,
  valueType: rule.value_type,
  value: rule.value,
  createdAt: rule.created_at,
  updatedAt: rule.updated_at,
});
