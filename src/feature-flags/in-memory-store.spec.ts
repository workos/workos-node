import { InMemoryStore } from './in-memory-store';
import { FlagPollEntryV2 } from './interfaces';

describe('InMemoryStore', () => {
  let store: InMemoryStore;

  const flagA: FlagPollEntryV2 = {
    slug: 'flag-a',
    enabled: true,
    default_value: true,
    off_value: false,
    rules: [],
  };

  const flagB: FlagPollEntryV2 = {
    slug: 'flag-b',
    enabled: false,
    default_value: false,
    off_value: false,
    rules: [],
  };

  beforeEach(() => {
    store = new InMemoryStore();
  });

  describe('swap', () => {
    it('replaces all flags', () => {
      store.swap({ 'flag-a': flagA });
      expect(store.size).toBe(1);

      store.swap({ 'flag-b': flagB });
      expect(store.size).toBe(1);
      expect(store.get('flag-a')).toBeUndefined();
      expect(store.get('flag-b')).toEqual(flagB);
    });
  });

  describe('get', () => {
    it('returns the entry for a known slug', () => {
      store.swap({ 'flag-a': flagA });
      expect(store.get('flag-a')).toEqual(flagA);
    });

    it('returns undefined for an unknown slug', () => {
      expect(store.get('unknown')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('returns the full map', () => {
      const flags = { 'flag-a': flagA, 'flag-b': flagB };
      store.swap(flags);
      expect(store.getAll()).toEqual(flags);
    });
  });

  describe('size', () => {
    it('starts at 0', () => {
      expect(store.size).toBe(0);
    });

    it('tracks the number of flags', () => {
      store.swap({ 'flag-a': flagA, 'flag-b': flagB });
      expect(store.size).toBe(2);
    });
  });
});
