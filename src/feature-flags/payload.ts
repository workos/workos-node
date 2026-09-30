import {
  FlagConditionV2,
  FlagCustomTarget,
  FlagPollEntry,
  FlagPollEntryV2,
  FlagPollResponseV2,
  FlagRuleV2,
  FlagTarget,
} from './interfaces';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTarget(value: unknown): value is FlagTarget {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.enabled === 'boolean'
  );
}

function isCustomTarget(value: unknown): value is FlagCustomTarget {
  return isTarget(value) && 'type' in value && typeof value.type === 'string';
}

function isV1Entry(value: unknown): value is FlagPollEntry {
  return (
    isRecord(value) &&
    typeof value.slug === 'string' &&
    typeof value.enabled === 'boolean' &&
    typeof value.default_value === 'boolean' &&
    isRecord(value.targets) &&
    Array.isArray(value.targets.users) &&
    value.targets.users.every(isTarget) &&
    Array.isArray(value.targets.organizations) &&
    value.targets.organizations.every(isTarget) &&
    (value.targets.custom_targets === undefined ||
      (Array.isArray(value.targets.custom_targets) &&
        value.targets.custom_targets.every(isCustomTarget)))
  );
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

/** Normalize both wire generations before swapping the store. Unknown shapes
 * leave the last good snapshot intact; bootstrap callers can still be ready. */
export function toV2(response: unknown): FlagPollResponseV2 | undefined {
  if (!isRecord(response)) return undefined;

  // A legacy flag can itself be named "version". Its entry is an object,
  // unlike the numeric marker on a versioned envelope.
  if ('version' in response && !isV1Entry(response.version)) {
    if (response.version !== 2 || !isRecord(response.flags)) return undefined;
    const entries: Array<[string, FlagPollEntryV2]> = [];
    for (const [slug, entry] of Object.entries(response.flags)) {
      if (!isV2Entry(entry)) return undefined;
      entries.push([slug, entry]);
    }
    return { version: 2, flags: Object.fromEntries(entries) };
  }

  const entries: Array<[string, FlagPollEntryV2]> = [];
  for (const [slug, entry] of Object.entries(response)) {
    if (!isV1Entry(entry)) return undefined;
    const targetsByType = new Map<string, string[]>();
    const addTarget = (type: string, target: FlagTarget) => {
      if (!target.enabled) return;
      const ids = targetsByType.get(type);
      if (ids) ids.push(target.id);
      else targetsByType.set(type, [target.id]);
    };
    for (const target of entry.targets.users) addTarget('user', target);
    for (const target of entry.targets.organizations)
      addTarget('organization', target);
    for (const target of entry.targets.custom_targets ?? [])
      addTarget(target.type, target);

    // Legacy target order has no meaning. Keep the synthetic rule order stable
    // so reordering a legacy response doesn't generate change events.
    const rules: FlagRuleV2[] = [...targetsByType]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([type, values]) => ({
        id: `v1:${type}`,
        kind: 'conditions',
        value: true,
        conditions: [{ target_type: type, operator: 'one_of', values }],
      }));
    entries.push([
      slug,
      {
        slug: entry.slug,
        enabled: entry.enabled,
        default_value: entry.default_value,
        off_value: false,
        rules,
      },
    ]);
  }
  return { version: 2, flags: Object.fromEntries(entries) };
}
