import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL } from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import {
  EvaluationContext,
  FlagChange,
  FlagPollEntryV2,
  FlagPollResponse,
  FlagPollResponseV2,
} from './interfaces';

const workos = new WorkOS('sk_test_example');
const exclusion = {
  id: 'rule_org',
  kind: 'conditions',
  value: false,
  conditions: [
    { target_type: 'organization', operator: 'one_of', values: ['org_1'] },
  ],
};
const inclusion = {
  id: 'rule_user',
  kind: 'conditions',
  value: true,
  conditions: [{ target_type: 'user', operator: 'one_of', values: ['user_1'] }],
};
const flag: FlagPollEntryV2 = {
  slug: 'flag',
  enabled: true,
  default_value: true,
  off_value: false,
  rules: [exclusion, inclusion],
};
const payload: FlagPollResponseV2 = { version: 2, flags: { flag } };

describe('v2 runtime payloads', () => {
  beforeEach(() => {
    fetch.resetMocks();
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('requests v2 and evaluates exclusions in payload order', async () => {
    fetchOnce(payload);
    const client = workos.featureFlags.createRuntimeClient();
    await jest.advanceTimersByTimeAsync(0);
    await client.waitUntilReady();

    expect(
      new URL(String(fetchURL())).searchParams.get('payload_version'),
    ).toBe('2');
    expect(
      client.isEnabled('flag', { userId: 'user_1', organizationId: 'org_1' }),
    ).toBe(false);
    expect(client.isEnabled('flag', { userId: 'user_1' })).toBe(true);
    expect(client.getFlag('flag')).toEqual(flag);
    expect(client.getStats().flagCount).toBe(1);
    client.close();
  });

  it.each([
    ['future version', { ...payload, version: 3 }],
    ['invalid version', { ...payload, version: '2' }],
    ['missing version', { flags: { flag } }],
    ['invalid flags', { version: 2, flags: null }],
    [
      'invalid entry',
      { version: 2, flags: { flag: { ...flag, rules: null } } },
    ],
    ['invalid legacy entry', { flag: { slug: 'flag', targets: null } }],
    ['null', null],
    ['array', []],
    ['scalar', false],
  ])(
    'ignores %s bootstrap data, resolves readiness, and then polls',
    async (_name, input) => {
      const bootstrapFlags: FlagPollResponse = JSON.parse(
        JSON.stringify(input),
      );
      const client = workos.featureFlags.createRuntimeClient({
        bootstrapFlags,
      });
      await client.waitUntilReady();

      expect(client.getStats().flagCount).toBe(0);
      expect(client.isEnabled('flag', {}, true)).toBe(true);

      fetchOnce(payload);
      await jest.advanceTimersByTimeAsync(0);
      expect(client.getStats().flagCount).toBe(1);
      client.close();
    },
  );

  const cases: Array<{
    name: string;
    config: Partial<FlagPollEntryV2>;
    context?: EvaluationContext;
    fallback?: boolean;
    expected: boolean;
  }> = [
    {
      name: 'off value overrides matching rules and both defaults',
      config: { enabled: false },
      context: { userId: 'user_1' },
      fallback: true,
      expected: false,
    },
    {
      name: 'a boolean off value is honored',
      config: { enabled: false, off_value: true },
      expected: true,
    },
    {
      name: 'an empty rule list serves the flag default',
      config: { rules: [], default_value: false },
      fallback: true,
      expected: false,
    },
    {
      name: 'no match serves the flag default, not the caller default',
      config: {},
      expected: true,
    },
    {
      name: 'a missing context type does not match',
      config: { default_value: false, rules: [inclusion] },
      expected: false,
    },
    {
      name: 'a matching false rule stops evaluation',
      config: {},
      context: { user: { id: 'user_1' }, organization: { id: 'org_1' } },
      fallback: true,
      expected: false,
    },
    {
      name: 'reordering conflicting target types changes the winner',
      config: { rules: [inclusion, exclusion] },
      context: { userId: 'user_1', organizationId: 'org_1' },
      expected: true,
    },
    {
      name: 'a later rule can match',
      config: { default_value: false },
      context: { userId: 'user_1' },
      expected: true,
    },
    {
      name: 'custom target membership can match any listed ID',
      config: {
        default_value: false,
        rules: [
          {
            ...inclusion,
            conditions: [
              {
                target_type: 'workspace',
                operator: 'one_of',
                values: ['ws_0', 'ws_1'],
              },
            ],
          },
        ],
      },
      context: { workspace: { id: 'ws_1' } },
      expected: true,
    },
    {
      name: 'membership uses exact, case-sensitive IDs',
      config: { default_value: false, rules: [inclusion] },
      context: { userId: 'USER_1' },
      expected: false,
    },
    {
      name: 'an ID from another type does not match',
      config: { default_value: false, rules: [inclusion] },
      context: { workspace: { id: 'user_1' } },
      expected: false,
    },
    {
      name: 'all conditions must match',
      config: {
        default_value: false,
        rules: [
          {
            ...inclusion,
            conditions: [...inclusion.conditions, ...exclusion.conditions],
          },
        ],
      },
      context: { userId: 'user_1', organizationId: 'org_1' },
      expected: true,
    },
    {
      name: 'one matching condition cannot override a failed condition',
      config: {
        default_value: false,
        rules: [
          {
            ...inclusion,
            conditions: [...inclusion.conditions, ...exclusion.conditions],
          },
        ],
      },
      context: { userId: 'user_1', organizationId: 'org_other' },
      expected: false,
    },
    {
      name: 'one matching condition cannot override a missing context type',
      config: {
        default_value: false,
        rules: [
          {
            ...inclusion,
            conditions: [...inclusion.conditions, ...exclusion.conditions],
          },
        ],
      },
      context: { userId: 'user_1' },
      expected: false,
    },
    {
      name: 'empty conditions never match',
      config: {
        default_value: false,
        rules: [{ ...inclusion, conditions: [] }],
      },
      expected: false,
    },
    {
      name: 'empty membership never matches',
      config: {
        default_value: false,
        rules: [
          {
            ...inclusion,
            conditions: [
              { target_type: 'user', operator: 'one_of', values: [] },
            ],
          },
        ],
      },
      context: { userId: 'user_1' },
      expected: false,
    },
    {
      name: 'unknown rule kinds are skipped even with matching conditions',
      config: {
        default_value: false,
        rules: [{ ...inclusion, kind: 'rollout' }],
      },
      context: { userId: 'user_1' },
      expected: false,
    },
    {
      name: 'unknown rules without conditions allow later rules to match',
      config: {
        default_value: false,
        rules: [{ id: 'future', kind: 'rollout', value: false }, inclusion],
      },
      context: { userId: 'user_1' },
      expected: true,
    },
    {
      name: 'unknown operators invalidate the whole rule',
      config: {
        default_value: false,
        rules: [
          {
            ...inclusion,
            conditions: [...inclusion.conditions, { operator: 'segment' }],
          },
        ],
      },
      context: { userId: 'user_1' },
      expected: false,
    },
    {
      name: 'unknown operators allow later rules to match',
      config: {
        default_value: false,
        rules: [
          {
            ...exclusion,
            conditions: [
              {
                target_type: 'user',
                operator: 'not_one_of',
                values: ['user_1'],
              },
            ],
          },
          inclusion,
        ],
      },
      context: { userId: 'user_1' },
      expected: true,
    },
    {
      name: 'unparseable matching values use the caller default and stop',
      config: {
        default_value: true,
        rules: [{ ...inclusion, value: 'true' }, inclusion],
      },
      context: { userId: 'user_1' },
      fallback: false,
      expected: false,
    },
    {
      name: 'unparseable off values use a true caller default',
      config: { enabled: false, off_value: 0, default_value: false },
      fallback: true,
      expected: true,
    },
    {
      name: 'unparseable defaults use the caller default',
      config: { rules: [], default_value: 'false' },
      expected: false,
    },
    {
      name: 'unparseable values in unmatched rules have no effect',
      config: { rules: [{ ...exclusion, value: null }] },
      context: { organizationId: 'org_other' },
      expected: true,
    },
    {
      name: 'malformed membership is nonmatching',
      config: {
        default_value: false,
        rules: [
          {
            ...inclusion,
            conditions: [
              { target_type: 'user', operator: 'one_of', values: 'user_1' },
            ],
          },
        ],
      },
      context: { userId: 'user_1' },
      expected: false,
    },
  ];

  it.each(cases)('$name', async ({ config, context, fallback, expected }) => {
    const client = workos.featureFlags.createRuntimeClient({
      bootstrapFlags: { version: 2, flags: { flag: { ...flag, ...config } } },
    });
    await client.waitUntilReady();
    expect(client.isEnabled('flag', context, fallback)).toBe(expected);
    client.close();
  });

  it('ignores extra payload keys and evaluates all flags with a false fallback', async () => {
    fetchOnce({
      ...payload,
      future: { version: 9 },
      flags: { flag, unknown: { ...flag, slug: 'unknown', default_value: 1 } },
    });
    const client = workos.featureFlags.createRuntimeClient();
    await jest.advanceTimersByTimeAsync(0);
    expect(client.getAllFlags({ organization: { id: 'org_1' } })).toEqual({
      flag: false,
      unknown: false,
    });
    expect(client.getAllFlags()).toEqual({ flag: true, unknown: false });
    expect(client.isEnabled('missing', {}, true)).toBe(true);
    client.close();
  });

  it('replaces v2 bootstrap data wholesale on the first poll without change events', async () => {
    const client = workos.featureFlags.createRuntimeClient({
      bootstrapFlags: payload,
    });
    const changes: FlagChange[] = [];
    client.on('change', (change) => changes.push(change));
    expect(client.isEnabled('flag')).toBe(true);
    fetchOnce({ version: 2, flags: {} });
    await jest.advanceTimersByTimeAsync(0);
    expect(client.getAllFlags()).toEqual({});
    expect(client.getStats().flagCount).toBe(0);
    expect(changes).toEqual([]);
    client.close();
  });

  it.each([
    ['rule order', { ...flag, rules: [inclusion, exclusion] }],
    [
      'rule value',
      { ...flag, rules: [{ ...exclusion, value: true }, inclusion] },
    ],
    [
      'membership',
      {
        ...flag,
        rules: [
          {
            ...inclusion,
            conditions: [
              { target_type: 'user', operator: 'one_of', values: ['user_2'] },
            ],
          },
        ],
      },
    ],
    ['off value', { ...flag, off_value: true }],
    ['default value', { ...flag, default_value: false }],
    ['enabled', { ...flag, enabled: false }],
    [
      'rule kind',
      { ...flag, rules: [{ ...exclusion, kind: 'rollout' }, inclusion] },
    ],
    [
      'condition operator',
      {
        ...flag,
        rules: [
          {
            ...exclusion,
            conditions: [
              { ...exclusion.conditions[0], operator: 'not_one_of' },
            ],
          },
          inclusion,
        ],
      },
    ],
    [
      'target type',
      {
        ...flag,
        rules: [
          {
            ...exclusion,
            conditions: [
              { ...exclusion.conditions[0], target_type: 'workspace' },
            ],
          },
          inclusion,
        ],
      },
    ],
    ['removed rule', { ...flag, rules: [inclusion] }],
  ])('emits complete v2 snapshots when %s changes', async (_name, current) => {
    fetchOnce(payload);
    const client = workos.featureFlags.createRuntimeClient();
    const changes: FlagChange[] = [];
    client.on('change', (change) => changes.push(change));
    await jest.advanceTimersByTimeAsync(0);
    expect(changes).toEqual([]);
    fetchOnce({ version: 2, flags: { flag: current } });
    await jest.advanceTimersByTimeAsync(30_000);
    expect(changes).toEqual([{ key: 'flag', previous: flag, current }]);
    client.close();
  });

  it('ignores membership and condition ordering when detecting changes', async () => {
    const conditions = [
      { target_type: 'user', operator: 'one_of', values: ['user_1', 'user_2'] },
      { target_type: 'workspace', operator: 'one_of', values: ['ws_1'] },
    ];
    fetchOnce({
      version: 2,
      flags: { flag: { ...flag, rules: [{ ...inclusion, conditions }] } },
    });
    const client = workos.featureFlags.createRuntimeClient();
    const changes: FlagChange[] = [];
    client.on('change', (change) => changes.push(change));
    await jest.advanceTimersByTimeAsync(0);
    fetchOnce({
      version: 2,
      flags: {
        flag: {
          ...flag,
          rules: [
            {
              ...inclusion,
              conditions: [
                conditions[1],
                { ...conditions[0], values: ['user_2', 'user_1'] },
              ],
            },
          ],
        },
      },
    });
    await jest.advanceTimersByTimeAsync(30_000);
    expect(changes).toEqual([]);
    client.close();
  });

  it('emits additions and removals while replacing the entire snapshot', async () => {
    fetchOnce(payload);
    const client = workos.featureFlags.createRuntimeClient();
    const changes: FlagChange[] = [];
    client.on('change', (change) => changes.push(change));
    await jest.advanceTimersByTimeAsync(0);
    const added = { ...flag, slug: 'added' };
    fetchOnce({ version: 2, flags: { added } });
    await jest.advanceTimersByTimeAsync(30_000);
    expect(changes).toEqual([
      { key: 'flag', previous: flag, current: null },
      { key: 'added', previous: null, current: added },
    ]);
    expect(client.getAllFlags()).toEqual({ added: true });
    client.close();
  });

  it.each([
    ['network failure', 'network'],
    ['request timeout', 'timeout'],
    ['unknown version', { ...payload, version: 3 }],
    [
      'malformed payload',
      { version: 2, flags: { flag: { ...flag, rules: null } } },
    ],
  ])(
    'keeps the last good snapshot after %s and recovers on the next poll',
    async (_name, failure) => {
      fetchOnce(payload);
      const client = workos.featureFlags.createRuntimeClient({
        requestTimeoutMs: 50,
      });
      const changes: FlagChange[] = [];
      const errors: Error[] = [];
      client.on('change', (change) => changes.push(change));
      client.on('error', (error) => errors.push(error));
      await jest.advanceTimersByTimeAsync(0);
      const lastSuccessfulPollAt = client.getStats().lastSuccessfulPollAt;
      if (failure === 'network') fetch.mockRejectOnce(new Error('offline'));
      else if (failure === 'timeout')
        fetch.mockResponseOnce(() => new Promise(() => {}));
      else fetchOnce(failure);
      await jest.advanceTimersByTimeAsync(30_050);
      expect(client.isEnabled('flag', { organizationId: 'org_1' })).toBe(false);
      expect(client.getAllFlags()).toEqual({ flag: true });
      expect(client.getStats()).toMatchObject({
        flagCount: 1,
        pollErrorCount: 1,
        lastSuccessfulPollAt,
      });
      expect(errors).toHaveLength(1);
      expect(changes).toEqual([]);
      fetchOnce({ version: 2, flags: {} });
      await jest.advanceTimersByTimeAsync(30_000);
      expect(client.getAllFlags()).toEqual({});
      expect(changes).toEqual([{ key: 'flag', previous: flag, current: null }]);
      client.close();
    },
  );

  it('converts legacy enabled targets to one true rule per type with stable change detection', async () => {
    const legacy = {
      flag: {
        slug: 'flag',
        enabled: true,
        default_value: false,
        targets: {
          users: [
            { id: 'user_1', enabled: true },
            { id: 'user_off', enabled: false },
          ],
          organizations: [{ id: 'org_off', enabled: false }],
          custom_targets: [
            { type: 'workspace', id: 'ws_1', enabled: true },
            { type: 'region', id: 'east', enabled: true },
            { type: 'workspace', id: 'ws_2', enabled: true },
            { type: 'workspace', id: 'ws_off', enabled: false },
          ],
        },
      },
    };
    fetchOnce(legacy);
    const client = workos.featureFlags.createRuntimeClient();
    const changes: FlagChange[] = [];
    client.on('change', (change) => changes.push(change));
    await jest.advanceTimersByTimeAsync(0);
    expect(client.getFlag('flag')).toEqual({
      slug: 'flag',
      enabled: true,
      default_value: false,
      off_value: false,
      rules: [
        {
          id: 'v1:region',
          kind: 'conditions',
          value: true,
          conditions: [
            { target_type: 'region', operator: 'one_of', values: ['east'] },
          ],
        },
        {
          id: 'v1:user',
          kind: 'conditions',
          value: true,
          conditions: [
            { target_type: 'user', operator: 'one_of', values: ['user_1'] },
          ],
        },
        {
          id: 'v1:workspace',
          kind: 'conditions',
          value: true,
          conditions: [
            {
              target_type: 'workspace',
              operator: 'one_of',
              values: ['ws_1', 'ws_2'],
            },
          ],
        },
      ],
    });
    expect(client.isEnabled('flag', { workspace: { id: 'ws_2' } })).toBe(true);
    expect(client.isEnabled('flag', { workspace: { id: 'ws_off' } })).toBe(
      false,
    );
    fetchOnce({
      flag: {
        ...legacy.flag,
        targets: {
          ...legacy.flag.targets,
          custom_targets: [...legacy.flag.targets.custom_targets].reverse(),
        },
      },
    });
    await jest.advanceTimersByTimeAsync(30_000);
    expect(changes).toEqual([]);
    // An API upgrade can start returning rules without restarting the SDK.
    fetchOnce(payload);
    await jest.advanceTimersByTimeAsync(30_000);
    expect(client.isEnabled('flag', { organizationId: 'org_1' })).toBe(false);
    // A rollback to an older API still replaces and evaluates the snapshot.
    fetchOnce(legacy);
    await jest.advanceTimersByTimeAsync(30_000);
    expect(client.isEnabled('flag', { workspace: { id: 'ws_2' } })).toBe(true);
    expect(client.getStats().pollErrorCount).toBe(0);
    client.close();
  });

  it.each([1, 2])(
    'accepts an empty v%s bootstrap snapshot',
    async (version) => {
      const bootstrapFlags: FlagPollResponse =
        version === 1 ? {} : { version: 2, flags: {} };
      const client = workos.featureFlags.createRuntimeClient({
        bootstrapFlags,
      });
      await client.waitUntilReady();
      expect(client.getAllFlags()).toEqual({});
      expect(client.isEnabled('absent', {}, true)).toBe(true);
      client.close();
    },
  );

  it.each([1, 2])(
    'preserves reserved-looking flag slugs in v%s payloads',
    async (version) => {
      const entries = ['version', 'flags', '__proto__', 'constructor'].map(
        (slug) => [
          slug,
          version === 1
            ? {
                slug,
                enabled: true,
                default_value: true,
                targets: { users: [], organizations: [] },
              }
            : { ...flag, slug },
        ],
      );
      const flags = Object.fromEntries(entries);
      fetchOnce(version === 1 ? flags : { version: 2, flags });
      const client = workos.featureFlags.createRuntimeClient();
      const changes: FlagChange[] = [];
      client.on('change', (change) => changes.push(change));
      expect(client.getFlag('constructor')).toBeUndefined();
      expect(client.isEnabled('toString', {}, true)).toBe(true);
      await jest.advanceTimersByTimeAsync(0);
      expect(client.getAllFlags()).toEqual(
        JSON.parse(
          '{"version":true,"flags":true,"__proto__":true,"constructor":true}',
        ),
      );
      expect(client.getFlag('__proto__')?.slug).toBe('__proto__');
      fetchOnce({ version: 2, flags: {} });
      await jest.advanceTimersByTimeAsync(30_000);
      expect(changes).toHaveLength(4);
      expect(changes.every((change) => change.current === null)).toBe(true);
      expect(client.getFlag('constructor')).toBeUndefined();
      client.close();
    },
  );

  it('does not mark a malformed initial poll ready or emit changes on recovery', async () => {
    fetchOnce({ version: 99, flags: {} });
    const client = workos.featureFlags.createRuntimeClient();
    client.on('error', () => {});
    const changes: FlagChange[] = [];
    client.on('change', (change) => changes.push(change));
    let ready = false;
    const readiness = client.waitUntilReady().then(() => {
      ready = true;
    });
    await jest.advanceTimersByTimeAsync(0);
    expect(ready).toBe(false);
    expect(client.getStats().lastSuccessfulPollAt).toBeNull();
    fetchOnce(payload);
    await jest.advanceTimersByTimeAsync(30_000);
    await readiness;
    expect(ready).toBe(true);
    expect(changes).toEqual([]);
    client.close();
  });

  it('retains the v2 snapshot and stops polling after a 401', async () => {
    fetchOnce(payload);
    const client = workos.featureFlags.createRuntimeClient();
    const failures: Error[] = [];
    client.on('error', () => {});
    client.on('failed', (error) => failures.push(error));
    await jest.advanceTimersByTimeAsync(0);
    fetchOnce({ message: 'Unauthorized' }, { status: 401 });
    await jest.advanceTimersByTimeAsync(30_000);
    expect(failures).toHaveLength(1);
    expect(client.getAllFlags({ organizationId: 'org_1' })).toEqual({
      flag: false,
    });
    await client.waitUntilReady();
    await jest.advanceTimersByTimeAsync(120_000);
    expect(fetch.mock.calls).toHaveLength(2);
    client.close();
  });

  it.each([null, false, 'invalid', []])(
    'never throws on a malformed top-level context: %j',
    (input) => {
      const context: EvaluationContext = JSON.parse(JSON.stringify(input));
      const client = workos.featureFlags.createRuntimeClient({
        bootstrapFlags: payload,
      });
      expect(client.isEnabled('flag', context)).toBe(true);
      expect(client.getAllFlags(context)).toEqual({ flag: true });
      client.close();
    },
  );
});
