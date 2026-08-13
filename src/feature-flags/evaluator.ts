import { InMemoryStore } from './in-memory-store';
import {
  EvaluationContext,
  EvaluationResource,
  FlagPollEntry,
  RuntimeClientLogger,
} from './interfaces';

// Mirror of the API's validation rules for custom target types and IDs.
const TARGET_TYPE_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;
const TARGET_ID_PATTERN = /^[A-Za-z0-9._:-]{1,255}$/;

const LEGACY_KEY_TO_TARGET_TYPE = new Map([
  ['userId', 'user'],
  ['organizationId', 'organization'],
]);

const isEvaluationResource = (value: unknown): value is EvaluationResource =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof value.id === 'string';

export class Evaluator {
  constructor(
    private readonly store: InMemoryStore,
    private readonly logger?: RuntimeClientLogger,
  ) {}

  isEnabled(
    flagKey: string,
    context: EvaluationContext = {},
    defaultValue: boolean = false,
  ): boolean {
    const entry = this.store.get(flagKey);

    if (!entry) {
      return defaultValue;
    }

    if (!entry.enabled) {
      return false;
    }

    // Evaluation is enable-only: any enabled target matching the context
    // turns the flag on, with no precedence between target types.
    for (const [targetType, targetId] of this.normalizeContext(context)) {
      if (this.hasEnabledTarget(entry, targetType, targetId)) {
        return true;
      }
    }

    return entry.default_value;
  }

  getAllFlags(context: EvaluationContext = {}): Record<string, boolean> {
    const flags = this.store.getAll();
    const result: Record<string, boolean> = {};

    for (const slug of Object.keys(flags)) {
      result[slug] = this.isEnabled(slug, context);
    }

    return result;
  }

  /**
   * Reduces either context form to target type → ID pairs. Evaluation must
   * never throw in application code, so every invalid piece of context
   * degrades to "matches no targets" with a logged warning instead of an
   * error.
   */
  private normalizeContext(context: EvaluationContext): Map<string, string> {
    const normalized = new Map<string, string>();
    const record: Record<string, unknown> = context;
    const keys = Object.keys(record);

    const legacyKeys = keys.filter((key) => LEGACY_KEY_TO_TARGET_TYPE.has(key));
    const typedKeys = keys.filter((key) => !LEGACY_KEY_TO_TARGET_TYPE.has(key));

    // The legacy and typed shapes cannot be mixed: inventing a precedence
    // between them would guess at caller intent, so a hybrid context matches
    // no targets at all.
    if (legacyKeys.length > 0 && typedKeys.length > 0) {
      this.logger?.warn(
        'Evaluation context mixes legacy keys (userId/organizationId) with typed target keys; no targets will match',
        { keys },
      );
      return normalized;
    }

    for (const key of legacyKeys) {
      const value = record[key];
      const targetType = LEGACY_KEY_TO_TARGET_TYPE.get(key);
      if (targetType && typeof value === 'string' && value !== '') {
        normalized.set(targetType, value);
      }
    }

    for (const key of typedKeys) {
      if (!TARGET_TYPE_PATTERN.test(key)) {
        this.logger?.warn(
          `Ignoring invalid target type in evaluation context: ${key}`,
        );
        continue;
      }

      const value = record[key];
      if (!isEvaluationResource(value)) {
        this.logger?.warn(
          `Ignoring target type with a missing or invalid resource id in evaluation context: ${key}`,
        );
        continue;
      }

      const { id } = value;
      if (!TARGET_ID_PATTERN.test(id) || id === '.' || id === '..') {
        this.logger?.warn(
          `Ignoring invalid target id in evaluation context for type: ${key}`,
        );
        continue;
      }

      normalized.set(key, id);
    }

    return normalized;
  }

  /**
   * A target participates in evaluation only while its `enabled` is true. A
   * `false` value is reserved for future disabled overrides and is treated
   * as if the target were absent.
   */
  private hasEnabledTarget(
    entry: FlagPollEntry,
    targetType: string,
    targetId: string,
  ): boolean {
    if (targetType === 'user') {
      return entry.targets.users.some((t) => t.id === targetId && t.enabled);
    }

    if (targetType === 'organization') {
      return entry.targets.organizations.some(
        (t) => t.id === targetId && t.enabled,
      );
    }

    return (entry.targets.custom_targets ?? []).some(
      (t) => t.type === targetType && t.id === targetId && t.enabled,
    );
  }
}
