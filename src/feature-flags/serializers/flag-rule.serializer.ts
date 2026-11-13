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
  createdAt: new Date(rule.created_at),
  updatedAt: new Date(rule.updated_at),
});
