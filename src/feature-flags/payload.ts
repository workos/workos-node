import {
  FlagConditionV2,
  FlagPollEntryV2,
  FlagPollResponseV2,
  FlagRuleV2,
} from './interfaces';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCondition(value: unknown): value is FlagConditionV2 {
  return (
    isRecord(value) &&
    typeof value.operator === 'string' &&
    (value.target_type === undefined || typeof value.target_type === 'string')
  );
}

function isRule(value: unknown): value is FlagRuleV2 {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.kind === 'string' &&
    (value.conditions === undefined ||
      (Array.isArray(value.conditions) && value.conditions.every(isCondition)))
  );
}

function isV2Entry(value: unknown): value is FlagPollEntryV2 {
  return (
    isRecord(value) &&
    typeof value.slug === 'string' &&
    typeof value.enabled === 'boolean' &&
    'default_value' in value &&
    'off_value' in value &&
    Array.isArray(value.rules) &&
    value.rules.every(isRule)
  );
}

/** Validate a payload before swapping the store. Unknown shapes leave the last
 * good snapshot intact; bootstrap callers can still be ready. */
export function toV2(response: unknown): FlagPollResponseV2 | undefined {
  if (
    !isRecord(response) ||
    response.version !== 2 ||
    !isRecord(response.flags)
  ) {
    return undefined;
  }

  const entries: Array<[string, FlagPollEntryV2]> = [];
  for (const [slug, entry] of Object.entries(response.flags)) {
    if (!isV2Entry(entry)) return undefined;
    entries.push([slug, entry]);
  }
  return { version: 2, flags: Object.fromEntries(entries) };
}
