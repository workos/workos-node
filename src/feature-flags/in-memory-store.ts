import { FlagPollEntry, FlagPollResponse } from './interfaces';

export class InMemoryStore {
  private flags: FlagPollResponse = {};

  swap(newFlags: FlagPollResponse): void {
    this.flags = { ...newFlags };
  }

  get(slug: string): FlagPollEntry | undefined {
    return this.flags[slug];
  }

  getAll(): FlagPollResponse {
    return this.flags;
  }

  get size(): number {
    return Object.keys(this.flags).length;
  }
}
