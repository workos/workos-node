export interface FlagPollCondition {
  // Future operators may carry different operands. Unsupported conditions
  // never match, even if another condition in the rule matches.
  operator: string;
  target_type?: string;
  values?: unknown;
}

export interface FlagPollRule {
  id: string;
  kind: string;
  // Future multivariate values must fall back to the caller's boolean default.
  value: unknown;
  conditions?: FlagPollCondition[];
}

export interface FlagPollEntry {
  slug: string;
  enabled: boolean;
  default_value: unknown;
  off_value: unknown;
  /** Evaluated in array order; the first matching rule wins. */
  rules: FlagPollRule[];
}

export interface FlagPollResponse {
  version: 2;
  flags: Record<string, FlagPollEntry>;
}
