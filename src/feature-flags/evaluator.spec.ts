import { Evaluator } from './evaluator';
import { InMemoryStore } from './in-memory-store';
import {
  EvaluationContext,
  FlagPollEntry,
  RuntimeClientLogger,
} from './interfaces';

describe('Evaluator', () => {
  let store: InMemoryStore;
  let evaluator: Evaluator;
  let logger: jest.Mocked<RuntimeClientLogger>;

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
      custom_targets: [
        { type: 'workspace', id: 'ws_123', enabled: true },
        { type: 'workspace', id: 'ws_off', enabled: false },
        { type: 'region', id: 'us-east-1', enabled: true },
      ],
    },
  };

  // Simulates a default-on flag with a disabled override, which the API
  // cannot produce yet: the row must not turn the flag off.
  const defaultOnFlag: FlagPollEntry = {
    slug: 'default-on-flag',
    enabled: true,
    default_value: true,
    targets: {
      users: [{ id: 'user_blocked', enabled: false }],
      organizations: [],
    },
  };

  beforeEach(() => {
    store = new InMemoryStore();
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    evaluator = new Evaluator(store, logger);
    store.swap({
      'enabled-flag': enabledFlag,
      'disabled-flag': disabledFlag,
      'targeted-flag': targetedFlag,
      'default-on-flag': defaultOnFlag,
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

    it('returns true for a matching enabled organization target', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { organizationId: 'org_123' }),
      ).toBe(true);
    });

    it('returns true for a matching enabled user target', () => {
      expect(evaluator.isEnabled('targeted-flag', { userId: 'user_456' })).toBe(
        true,
      );
    });

    it('treats targets with enabled=false as not present', () => {
      // No enabled match, so the flag falls back to its default value —
      // false here, but crucially the target does not force the flag off.
      expect(
        evaluator.isEnabled('targeted-flag', { userId: 'user_blocked' }),
      ).toBe(false);
      expect(
        evaluator.isEnabled('default-on-flag', { userId: 'user_blocked' }),
      ).toBe(true);
    });

    it('matches any enabled target with no precedence between types', () => {
      expect(
        evaluator.isEnabled('targeted-flag', {
          userId: 'user_blocked',
          organizationId: 'org_123',
        }),
      ).toBe(true);
    });

    it('falls back to organization target when user target does not match', () => {
      expect(
        evaluator.isEnabled('targeted-flag', {
          userId: 'user_other',
          organizationId: 'org_123',
        }),
      ).toBe(true);
    });

    it('returns default_value when no target matches', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { userId: 'user_other' }),
      ).toBe(false);

      expect(
        evaluator.isEnabled('enabled-flag', { userId: 'user_other' }),
      ).toBe(true);
    });
  });

  describe('typed evaluation contexts', () => {
    it('matches custom targets by exact type and id', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { workspace: { id: 'ws_123' } }),
      ).toBe(true);
      expect(
        evaluator.isEnabled('targeted-flag', { region: { id: 'us-east-1' } }),
      ).toBe(true);

      // A missing or mistyped target is a valid empty match, not an error.
      expect(
        evaluator.isEnabled('targeted-flag', { workspace: { id: 'ws_456' } }),
      ).toBe(false);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('accepts built-in types in the typed form', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { user: { id: 'user_456' } }),
      ).toBe(true);
      expect(
        evaluator.isEnabled('targeted-flag', {
          organization: { id: 'org_123' },
        }),
      ).toBe(true);
    });

    it('treats custom targets with enabled=false as not present', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { workspace: { id: 'ws_off' } }),
      ).toBe(false);
    });

    it('evaluates safely when the payload has no custom_targets field', () => {
      expect(
        evaluator.isEnabled('enabled-flag', { workspace: { id: 'ws_123' } }),
      ).toBe(true);
      expect(
        evaluator.isEnabled('default-on-flag', {
          workspace: { id: 'ws_123' },
        }),
      ).toBe(true);
    });

    it('rejects a context mixing legacy and typed keys', () => {
      const hybridContext: EvaluationContext = {
        userId: 'user_456',
        workspace: { id: 'ws_123' },
      };

      expect(evaluator.isEnabled('targeted-flag', hybridContext)).toBe(false);
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it('does not treat unset keys as part of the context shape', () => {
      expect(
        evaluator.isEnabled('targeted-flag', {
          userId: undefined,
          workspace: { id: 'ws_123' },
        }),
      ).toBe(true);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('ignores scalar extra fields on a legacy context', () => {
      const legacyWithExtras = {
        userId: 'user_456',
        requestId: 'req_1',
      } as EvaluationContext;

      expect(evaluator.isEnabled('targeted-flag', legacyWithExtras)).toBe(true);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('ignores invalid target type keys with a warning', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { Workspace: { id: 'ws_123' } }),
      ).toBe(false);
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it('ignores typed entries with invalid ids with a warning', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { workspace: { id: '..' } }),
      ).toBe(false);
      expect(
        evaluator.isEnabled('targeted-flag', { workspace: { id: 'ws 123' } }),
      ).toBe(false);
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });

    it('never throws on malformed context values', () => {
      const malformedContext = {
        workspace: 'ws_123',
      } as unknown as EvaluationContext;

      expect(evaluator.isEnabled('targeted-flag', malformedContext)).toBe(
        false,
      );
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllFlags', () => {
    it('evaluates all flags for the given context', () => {
      const result = evaluator.getAllFlags({ userId: 'user_456' });

      expect(result).toEqual({
        'enabled-flag': true,
        'disabled-flag': false,
        'targeted-flag': true,
        'default-on-flag': true,
      });
    });

    it('evaluates all flags for a typed context', () => {
      const result = evaluator.getAllFlags({ workspace: { id: 'ws_123' } });

      expect(result).toEqual({
        'enabled-flag': true,
        'disabled-flag': false,
        'targeted-flag': true,
        'default-on-flag': true,
      });
    });

    it('warns once per call for an invalid context, not once per flag', () => {
      evaluator.getAllFlags({ Workspace: { id: 'ws_123' } });

      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it('works with empty context', () => {
      const result = evaluator.getAllFlags();

      expect(result).toEqual({
        'enabled-flag': true,
        'disabled-flag': false,
        'targeted-flag': false,
        'default-on-flag': true,
      });
    });
  });
});
