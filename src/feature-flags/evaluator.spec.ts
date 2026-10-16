import { Evaluator } from './evaluator';
import { InMemoryStore } from './in-memory-store';
import {
  EvaluationContext,
  FlagPollEntry,
  RuntimeClientLogger,
} from './interfaces';

const membershipRule = (targetType: string, values: string[]) => ({
  id: `rule_${targetType}`,
  kind: 'conditions',
  value: true,
  conditions: [{ target_type: targetType, operator: 'one_of', values }],
});

describe('Evaluator', () => {
  let store: InMemoryStore;
  let evaluator: Evaluator;
  let logger: jest.Mocked<RuntimeClientLogger>;

  const enabledFlag: FlagPollEntry = {
    slug: 'enabled-flag',
    enabled: true,
    default_value: true,
    off_value: false,
    rules: [],
  };

  const disabledFlag: FlagPollEntry = {
    slug: 'disabled-flag',
    enabled: false,
    default_value: true,
    off_value: false,
    rules: [],
  };

  const targetedFlag: FlagPollEntry = {
    slug: 'targeted-flag',
    enabled: true,
    default_value: false,
    off_value: false,
    rules: [
      membershipRule('organization', ['org_123']),
      membershipRule('user', ['user_456']),
      membershipRule('workspace', ['ws_123']),
      membershipRule('region', ['us-east-1']),
    ],
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

    it('returns true for a matching organization rule', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { organizationId: 'org_123' }),
      ).toBe(true);
    });

    it('returns true for a matching user rule', () => {
      expect(evaluator.isEnabled('targeted-flag', { userId: 'user_456' })).toBe(
        true,
      );
    });

    it('falls back to the organization rule when the user rule does not match', () => {
      expect(
        evaluator.isEnabled('targeted-flag', {
          userId: 'user_other',
          organizationId: 'org_123',
        }),
      ).toBe(true);
    });

    it('returns default_value when no rule matches', () => {
      expect(
        evaluator.isEnabled('targeted-flag', { userId: 'user_other' }),
      ).toBe(false);

      expect(
        evaluator.isEnabled('enabled-flag', { userId: 'user_other' }),
      ).toBe(true);
    });
  });

  describe('typed evaluation contexts', () => {
    it('matches custom target rules by exact type and id', () => {
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
      });
    });

    it('evaluates all flags for a typed context', () => {
      const result = evaluator.getAllFlags({ workspace: { id: 'ws_123' } });

      expect(result).toEqual({
        'enabled-flag': true,
        'disabled-flag': false,
        'targeted-flag': true,
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
      });
    });
  });
});
