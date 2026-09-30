import { FlagPollEntryV2 } from './flag-poll-response.interface';

export interface FlagChange {
  key: string;
  previous: FlagPollEntryV2 | null;
  current: FlagPollEntryV2 | null;
}
