export interface FlagConditionV2 {
  // Future operators may carry different operands. Unsupported conditions
  // never match, even if another condition in the rule matches.
  operator: string;
  target_type?: string;
  values?: unknown;
}

export interface FlagRuleV2 {
  id: string;
  kind: string;
  // Future multivariate values must fall back to the caller's boolean default.
  value: unknown;
  conditions?: FlagConditionV2[];
}

export interface FlagPollEntryV2 {
  slug: string;
  enabled: boolean;
  default_value: unknown;
  off_value: unknown;
  /** Evaluated in array order; the first matching rule wins. */
  rules: FlagRuleV2[];
}

export interface FlagPollResponseV2 {
  version: 2;
  flags: Record<string, FlagPollEntryV2>;
}
