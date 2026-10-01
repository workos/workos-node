import fetch from 'jest-fetch-mock';
import { ConflictException } from '../common/exceptions';
import {
  fetchBody,
  fetchMethod,
  fetchOnce,
  fetchSearchParams,
  fetchURL,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import { CreateRuleWithTargetsError } from './create-rule-with-targets-error';
import { FlagRuleResponse, FlagTargetMembershipResponse } from './interfaces';

const workos = new WorkOS('sk_test_rule_management', { maxRetries: 0 });

const rule: FlagRuleResponse = {
  object: 'flag_rule',
  id: 'flag_rule_01H00000000000000000000001',
  flag_id: 'flag_01H00000000000000000000001',
  flag_slug: 'new-checkout',
  environment_id: 'environment_01H00000000000000000000001',
  target_type: 'organization',
  position: 2,
  value_type: 'boolean',
  value: false,
  created_at: '2026-10-01T00:00:00.000Z',
  updated_at: '2026-10-01T00:00:00.000Z',
};

const target: FlagTargetMembershipResponse = {
  object: 'flag_target',
  id: 'flag_target_01H00000000000000000000001',
  rule_id: rule.id,
  flag_id: rule.flag_id,
  flag_slug: rule.flag_slug,
  environment_id: rule.environment_id,
  target_type: 'organization',
  target_id: 'org_01H00000000000000000000001',
  created_at: '2026-10-01T00:00:00.000Z',
  updated_at: '2026-10-01T00:00:00.000Z',
};

describe('Feature flag rule management', () => {
  beforeEach(() => fetch.resetMocks());

  it.each([
    ['organization', false],
    ['user', true],
    ['workspace', true],
  ])('creates a %s rule serving %s', async (targetType, value) => {
    fetchOnce({ ...rule, target_type: targetType, value }, { status: 201 });

    const result = await workos.featureFlags.createFlagRule({
      featureFlag: 'new-checkout',
      targetType,
      value,
    });

    expect(new URL(String(fetchURL())).pathname).toBe('/flag_rules');
    expect(fetchMethod()).toBe('POST');
    expect(fetchBody()).toEqual({
      feature_flag: 'new-checkout',
      target_type: targetType,
      value,
    });
    expect(result).toEqual({
      object: 'flag_rule',
      id: 'flag_rule_01H00000000000000000000001',
      flagId: 'flag_01H00000000000000000000001',
      flagSlug: 'new-checkout',
      environmentId: 'environment_01H00000000000000000000001',
      targetType,
      position: 2,
      valueType: 'boolean',
      value,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    });
  });

  it('paginates rules without overriding evaluation order or losing the flag filter', async () => {
    const first = {
      object: 'list',
      data: [rule],
      list_metadata: { before: null, after: rule.id },
    };
    fetchOnce(first);
    fetchOnce(first);
    fetchOnce({
      object: 'list',
      data: [{ ...rule, id: 'flag_rule_next', position: 3 }],
      list_metadata: { before: rule.id, after: null },
    });

    const page = await workos.featureFlags.listFlagRules({
      featureFlag: 'new-checkout',
    });
    expect(page.listMetadata).toEqual({ before: null, after: rule.id });
    const all = await page.autoPagination();

    expect(all.map(({ id, position }) => ({ id, position }))).toEqual([
      { id: rule.id, position: 2 },
      { id: 'flag_rule_next', position: 3 },
    ]);
    expect(
      fetch.mock.calls.map(([url]) => {
        const request = new URL(String(url));
        expect(request.pathname).toBe('/flag_rules');
        return Object.fromEntries(request.searchParams);
      }),
    ).toEqual([
      { feature_flag: 'new-checkout' },
      { feature_flag: 'new-checkout', limit: '100' },
      { feature_flag: 'new-checkout', limit: '100', after: rule.id },
    ]);
  });

  it('passes an explicit page limit and before cursor', async () => {
    fetchOnce({ object: 'list', data: [], list_metadata: {} });
    await workos.featureFlags.listFlagRules({
      featureFlag: 'a flag & more',
      limit: 10,
      before: rule.id,
    });
    expect(fetchSearchParams()).toEqual({
      feature_flag: 'a flag & more',
      limit: '10',
      before: rule.id,
    });
  });

  it('gets a rule with a null target type and encodes its ID', async () => {
    fetchOnce({ ...rule, target_type: null });
    const result = await workos.featureFlags.getFlagRule(
      'rule/with?reserved#chars',
    );
    expect(new URL(String(fetchURL())).pathname).toBe(
      '/flag_rules/rule%2Fwith%3Freserved%23chars',
    );
    expect(fetchMethod()).toBe('GET');
    expect(result.targetType).toBeNull();
  });

  it('deletes a rule by its encoded ID', async () => {
    fetchOnce({}, { status: 204 });
    await workos.featureFlags.deleteFlagRule('rule/with?reserved#chars');
    expect(new URL(String(fetchURL())).pathname).toBe(
      '/flag_rules/rule%2Fwith%3Freserved%23chars',
    );
    expect(fetchMethod()).toBe('DELETE');
  });

  it('creates a membership using only the rule and target IDs', async () => {
    fetchOnce(target, { status: 201 });
    const result = await workos.featureFlags.createFlagTarget({
      ruleId: rule.id,
      targetId: target.target_id,
    });
    expect(new URL(String(fetchURL())).pathname).toBe('/flag_targets');
    expect(fetchMethod()).toBe('POST');
    expect(fetchBody()).toEqual({
      rule_id: rule.id,
      target_id: target.target_id,
    });
    expect(result).toEqual({
      object: 'flag_target',
      id: 'flag_target_01H00000000000000000000001',
      ruleId: 'flag_rule_01H00000000000000000000001',
      flagId: 'flag_01H00000000000000000000001',
      flagSlug: 'new-checkout',
      environmentId: 'environment_01H00000000000000000000001',
      targetType: 'organization',
      targetId: 'org_01H00000000000000000000001',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    });
  });

  it('deletes a membership by its encoded membership ID', async () => {
    fetchOnce({}, { status: 204 });
    await workos.featureFlags.deleteFlagTarget('target/with?reserved#chars');
    expect(new URL(String(fetchURL())).pathname).toBe(
      '/flag_targets/target%2Fwith%3Freserved%23chars',
    );
    expect(fetchMethod()).toBe('DELETE');
  });

  describe('createRuleWithTargets', () => {
    it('uses the created rule ID and preserves the target order', async () => {
      fetchOnce(rule, { status: 201 });
      fetchOnce(target, { status: 201 });
      fetchOnce(
        { ...target, id: 'flag_target_second', target_id: 'org_second' },
        { status: 201 },
      );

      const result = await workos.featureFlags.createRuleWithTargets({
        featureFlag: 'new-checkout',
        targetType: 'organization',
        value: false,
        targetIds: [target.target_id, 'org_second'],
      });

      expect(
        fetch.mock.calls.map(([url, init]) => ({
          path: new URL(String(url)).pathname,
          method: init?.method,
          body: JSON.parse(String(init?.body)),
        })),
      ).toEqual([
        {
          path: '/flag_rules',
          method: 'POST',
          body: {
            feature_flag: 'new-checkout',
            target_type: 'organization',
            value: false,
          },
        },
        {
          path: '/flag_targets',
          method: 'POST',
          body: { rule_id: rule.id, target_id: target.target_id },
        },
        {
          path: '/flag_targets',
          method: 'POST',
          body: { rule_id: rule.id, target_id: 'org_second' },
        },
      ]);
      expect(result.rule.id).toBe(rule.id);
      expect(result.targets.map(({ targetId }) => targetId)).toEqual([
        target.target_id,
        'org_second',
      ]);
    });

    it('supports an empty rule', async () => {
      fetchOnce(rule, { status: 201 });
      const result = await workos.featureFlags.createRuleWithTargets({
        featureFlag: 'new-checkout',
        targetType: 'organization',
        value: false,
        targetIds: [],
      });
      expect(result.rule.id).toBe(rule.id);
      expect(result.targets).toEqual([]);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('preserves a rule creation conflict without attempting any targets', async () => {
      fetchOnce(
        {
          message: 'Rule already exists',
          code: 'flag_rule_already_exists_exception',
        },
        { status: 409 },
      );
      await expect(
        workos.featureFlags.createRuleWithTargets({
          featureFlag: 'new-checkout',
          targetType: 'organization',
          value: false,
          targetIds: [target.target_id],
        }),
      ).rejects.toMatchObject({
        name: 'ConflictException',
        status: 409,
        code: 'flag_rule_already_exists_exception',
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('reports partial progress and stops at the first failed target without deleting the rule', async () => {
      fetchOnce(rule, { status: 201 });
      fetchOnce(target, { status: 201 });
      fetchOnce({ message: 'Target belongs to another rule' }, { status: 409 });
      const error = await workos.featureFlags
        .createRuleWithTargets({
          featureFlag: 'new-checkout',
          targetType: 'organization',
          value: false,
          targetIds: [target.target_id, 'org_conflict', 'org_never_attempted'],
        })
        .catch((cause: unknown) => cause);

      expect(error).toBeInstanceOf(CreateRuleWithTargetsError);
      if (!(error instanceof CreateRuleWithTargetsError)) {
        throw new Error('Expected a partial creation error');
      }
      expect(error.rule.id).toBe(rule.id);
      expect(error.targets.map(({ id }) => id)).toEqual([target.id]);
      expect(error.failedTargetId).toBe('org_conflict');
      expect(error.cause).toBeInstanceOf(ConflictException);
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });
});
