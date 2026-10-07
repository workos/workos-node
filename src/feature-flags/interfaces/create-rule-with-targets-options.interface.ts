import { CreateFlagRuleOptions } from './create-flag-rule-options.interface';
import { FlagRule } from './flag-rule.interface';
import { FlagTargetMembership } from './flag-target-membership.interface';

export interface CreateRuleWithTargetsOptions extends CreateFlagRuleOptions {
  targetIds: string[];
}

export interface CreateRuleWithTargetsResult {
  rule: FlagRule;
  targets: FlagTargetMembership[];
}
