import { FlagPollEntry } from './flag-poll-response.interface';

export interface FlagChange {
  key: string;
  previous: FlagPollEntry | null;
  current: FlagPollEntry | null;
}
