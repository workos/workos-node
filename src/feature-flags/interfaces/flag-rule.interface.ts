export interface FlagRule {
  object: 'flag_rule';
  id: string;
  flagId: string;
  flagSlug: string;
  environmentId: string;
  /** Null for rules that match every context. */
  targetType: string | null;
  /** Rules are evaluated in ascending position order. */
  position: number;
  valueType: 'boolean';
  value: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlagRuleResponse {
  object: 'flag_rule';
  id: string;
  flag_id: string;
  flag_slug: string;
  environment_id: string;
  target_type: string | null;
  position: number;
  value_type: 'boolean';
  value: boolean;
  created_at: string;
  updated_at: string;
}
