import { CreateFlagRuleOptions } from './create-flag-rule-options.interface';
import { FlagRule } from './flag-rule.interface';
import { FlagTarget } from './flag-target.interface';

export interface CreateRuleWithTargetsOptions extends CreateFlagRuleOptions {
  targetIds: string[];
}

export interface CreateRuleWithTargetsResult {
  rule: FlagRule;
  targets: FlagTarget[];
}
