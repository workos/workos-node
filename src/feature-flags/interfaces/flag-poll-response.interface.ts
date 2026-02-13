export interface FlagTarget {
  id: string;
  enabled: boolean;
}

export interface FlagPollEntry {
  slug: string;
  enabled: boolean;
  default_value: boolean;
  targets: {
    users: FlagTarget[];
    organizations: FlagTarget[];
  };
}

export type FlagPollResponse = Record<string, FlagPollEntry>;
