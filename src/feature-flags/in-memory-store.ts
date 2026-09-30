import { FlagPollEntryV2, FlagPollResponseV2 } from './interfaces';

export class InMemoryStore {
  private flags: FlagPollResponseV2['flags'] = {};

  swap(newFlags: FlagPollResponseV2['flags']): void {
    this.flags = { ...newFlags };
  }

  get(slug: string): FlagPollEntryV2 | undefined {
    return Object.hasOwn(this.flags, slug) ? this.flags[slug] : undefined;
  }

  getAll(): FlagPollResponseV2['flags'] {
    return { ...this.flags };
  }

  get size(): number {
    return Object.keys(this.flags).length;
  }
}
