import { Evaluator } from './evaluator';
import { InMemoryStore } from './in-memory-store';
import { FlagPollEntry } from './interfaces';

describe('Evaluator', () => {
  let store: InMemoryStore;
  let evaluator: Evaluator;

  const enabledFlag: FlagPollEntry = {
    slug: 'enabled-flag',
    enabled: true,
    default_value: true,
    targets: { users: [], organizations: [] },
  };

  const disabledFlag: FlagPollEntry = {
    slug: 'disabled-flag',
    enabled: false,
    default_value: true,
    targets: { users: [], organizations: [] },
  };

  const targetedFlag: FlagPollEntry = {
    slug: 'targeted-flag',
    enabled: true,
    default_value: false,
    targets: {
      organizations: [{ id: 'org_123', enabled: true }],
      users: [
        { id: 'user_456', enabled: true },
        { id: 'user_blocked', enabled: false },
      ],
    },
  };

  beforeEach(() => {
    store = new InMemoryStore();
    evaluator = new Evaluator(store);
    store.swap({
      'enabled-flag': enabledFlag,
      'disabled-flag': disabledFlag,
      'targeted-flag': targetedFlag,
    });
  });

  describe('isEnabled', () => {
    it('returns defaultValue when flag is not found', () => {
      expect(evaluator.isEnabled('unknown')).toBe(false);
      expect(evaluator.isEnabled('unknown', {}, true)).toBe(true);
    });

    it('returns false when flag is disabled (enabled=false)', () => {
      expect(evaluator.isEnabled('disabled-flag')).toBe(false);
    });

    it('returns target.enabled for matching organization', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { organizationId: 'org_123' }),
      ).toBe(true);
    });

    it('returns target.enabled for matching user', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { userId: 'user_456' }),
      ).toBe(true);
    });

    it('returns false for user target with enabled=false', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { userId: 'user_blocked' }),
      ).toBe(false);
    });

    it('returns default_value when no target matches', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { userId: 'user_other' }),
      ).toBe(false);

      expect(evaluator.isEnabled('enabled-flag', { userId: 'user_other' })).toBe(
        true,
      );
    });
  });

  describe('getAllFlags', () => {
    it('evaluates all flags for the given context', () => {
      const result = evaluator.getAllFlags({ userId: 'user_456' });

      expect(result).toEqual({
        'enabled-flag': true,
        'disabled-flag': false,
        'targeted-flag': true,
      });
    });

    it('works with empty context', () => {
      const result = evaluator.getAllFlags();

      expect(result).toEqual({
        'enabled-flag': true,
        'disabled-flag': false,
        'targeted-flag': false,
      });
    });
  });
});
