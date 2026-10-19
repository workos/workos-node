import {
  FlagPollCondition,
  FlagPollEntry,
  FlagPollResponse,
  FlagPollRule,
} from './interfaces';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCondition(value: unknown): value is FlagPollCondition {
  return (
    isRecord(value) &&
    typeof value.operator === 'string' &&
    (value.target_type === undefined ||
      typeof value.target_type === 'string') &&
    // `one_of` always carries a list of IDs. Other operators may carry
    // different operands; they pass through and never match.
    (value.operator !== 'one_of' || Array.isArray(value.values))
  );
}

function isRule(value: unknown): value is FlagPollRule {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.kind === 'string' &&
    (value.conditions === undefined ||
      (Array.isArray(value.conditions) && value.conditions.every(isCondition)))
  );
}

function isEntry(value: unknown): value is FlagPollEntry {
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

/** Validate a payload before swapping the store. One invalid entry rejects the
 * whole payload, so the store never holds a partial snapshot and the last good
 * one stays intact; bootstrap callers can still be ready. */
export function parseFlagPollResponse(
  response: unknown,
): FlagPollResponse | undefined {
  if (
    !isRecord(response) ||
    response.version !== 2 ||
    !isRecord(response.flags)
  ) {
    return undefined;
  }

  const entries: Array<[string, FlagPollEntry]> = [];
  for (const [slug, entry] of Object.entries(response.flags)) {
    if (!isEntry(entry)) return undefined;
    entries.push([slug, entry]);
  }
  return { version: 2, flags: Object.fromEntries(entries) };
}
