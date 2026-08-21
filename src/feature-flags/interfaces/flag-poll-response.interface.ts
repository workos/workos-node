export interface FlagPollTarget {
  id: string;
  enabled: boolean;
}

export interface FlagCustomTarget {
  type: string;
  id: string;
  enabled: boolean;
}

export interface FlagPollEntry {
  slug: string;
  enabled: boolean;
  default_value: boolean;
  targets: {
    users: FlagPollTarget[];
    organizations: FlagPollTarget[];
    /** Absent until the API's custom-targets rollout flag is enabled. */
    custom_targets?: FlagCustomTarget[];
  };
}

export type FlagPollResponse = Record<string, FlagPollEntry>;
