import { FlagPollEntry, FlagPollResponse } from './interfaces';

export class InMemoryStore {
  private flags: FlagPollResponse['flags'] = {};

  swap(newFlags: FlagPollResponse['flags']): void {
    this.flags = { ...newFlags };
  }

  get(slug: string): FlagPollEntry | undefined {
    return Object.hasOwn(this.flags, slug) ? this.flags[slug] : undefined;
  }

  getAll(): FlagPollResponse['flags'] {
    return { ...this.flags };
  }

  get size(): number {
    return Object.keys(this.flags).length;
  }
}
