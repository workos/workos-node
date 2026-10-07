import crypto from 'crypto';
import fetch from 'jest-fetch-mock';
import { WorkOS } from '../workos';
import {
  EventResponse,
  EventName,
  FeatureFlagActor,
  FeatureFlagEventResponseData,
} from '../common/interfaces';
import { FlagRuleResponse } from '../feature-flags/interfaces';
import { fetchOnce, fetchSearchParams } from '../common/utils/test-utils';

const actor: FeatureFlagActor = {
  id: 'user_actor',
  source: 'dashboard',
  name: null,
};
const timestamps = {
  created_at: '2026-10-07T12:00:00.000Z',
  updated_at: '2026-10-07T12:01:00.000Z',
};
const flag: FeatureFlagEventResponseData = {
  object: 'feature_flag',
  id: 'flag_test',
  environment_id: 'environment_test',
  slug: 'new-checkout',
  name: 'New checkout',
  description: null,
  owner: { email: 'owner@example.com', first_name: null, last_name: 'Owner' },
  tags: ['beta'],
  enabled: true,
  default_value: false,
  ...timestamps,
};
const expectedFlag = {
  object: 'feature_flag',
  id: 'flag_test',
  environmentId: 'environment_test',
  slug: 'new-checkout',
  name: 'New checkout',
  description: null,
  owner: { email: 'owner@example.com', firstName: null, lastName: 'Owner' },
  tags: ['beta'],
  enabled: true,
  defaultValue: false,
  createdAt: '2026-10-07T12:00:00.000Z',
  updatedAt: '2026-10-07T12:01:00.000Z',
};
const rule: FlagRuleResponse = {
  object: 'flag_rule',
  id: 'flag_rule_test',
  flag_id: 'flag_test',
  flag_slug: 'new-checkout',
  environment_id: 'environment_test',
  target_type: null,
  position: 0,
  value_type: 'boolean',
  value: false,
  ...timestamps,
};
const expectedRule = {
  object: 'flag_rule',
  id: 'flag_rule_test',
  flagId: 'flag_test',
  flagSlug: 'new-checkout',
  environmentId: 'environment_test',
  targetType: null,
  position: 0,
  valueType: 'boolean',
  value: false,
  createdAt: '2026-10-07T12:00:00.000Z',
  updatedAt: '2026-10-07T12:01:00.000Z',
};
const target = {
  object: 'flag_target',
  id: 'flag_target_test',
  flag_id: 'flag_test',
  flag_slug: 'new-checkout',
  environment_id: 'environment_test',
  target_type: 'organization',
  target_id: 'org_test',
  ...timestamps,
};
const expectedTarget = {
  object: 'flag_target',
  id: 'flag_target_test',
  flagId: 'flag_test',
  flagSlug: 'new-checkout',
  environmentId: 'environment_test',
  targetType: 'organization',
  targetId: 'org_test',
  createdAt: '2026-10-07T12:00:00.000Z',
  updatedAt: '2026-10-07T12:01:00.000Z',
};

// API schema fixtures assert the public event boundary, including fields that
// differ from REST flags and the historical value-bearing target contract.
interface EventCase {
  name: string;
  response: EventResponse;
  expected: object;
}
const eventBase = { id: 'event_test', created_at: timestamps.created_at };
const responseContext = { client_id: 'client_test', actor };
const expectedContext = { clientId: 'client_test', actor };
const ruleEvents: Array<
  | 'feature_flags.flag_rule.created'
  | 'feature_flags.flag_rule.updated'
  | 'feature_flags.flag_rule.deleted'
> = [
  'feature_flags.flag_rule.created',
  'feature_flags.flag_rule.updated',
  'feature_flags.flag_rule.deleted',
];
const targetEvents: Array<
  'feature_flags.flag_target.created' | 'feature_flags.flag_target.deleted'
> = ['feature_flags.flag_target.created', 'feature_flags.flag_target.deleted'];
const cases: EventCase[] = [
  {
    name: 'feature_flags.flag.created',
    response: {
      ...eventBase,
      event: 'feature_flags.flag.created',
      data: flag,
      context: responseContext,
    },
    expected: { data: expectedFlag, context: expectedContext },
  },
  {
    name: 'feature_flags.flag.deleted with no owner',
    response: {
      ...eventBase,
      event: 'feature_flags.flag.deleted',
      data: { ...flag, owner: null },
      context: responseContext,
    },
    expected: {
      data: { ...expectedFlag, owner: null },
      context: expectedContext,
    },
  },
  {
    name: 'feature_flags.flag.updated with previous attributes',
    response: {
      ...eventBase,
      event: 'feature_flags.flag.updated',
      data: flag,
      context: {
        ...responseContext,
        previous_attributes: {
          data: {
            name: 'Old checkout',
            description: null,
            tags: [],
            enabled: false,
            default_value: false,
          },
        },
      },
    },
    expected: {
      data: expectedFlag,
      context: {
        ...expectedContext,
        previousAttributes: {
          data: {
            name: 'Old checkout',
            description: null,
            tags: [],
            enabled: false,
            defaultValue: false,
          },
        },
      },
    },
  },
  ...ruleEvents.map((event): EventCase => {
    const withActor = event !== 'feature_flags.flag_rule.created';
    return {
      name: event,
      response: {
        ...eventBase,
        event,
        data: rule,
        context: { client_id: 'client_test', ...(withActor ? { actor } : {}) },
      },
      expected: {
        data: expectedRule,
        context: { clientId: 'client_test', ...(withActor ? { actor } : {}) },
      },
    };
  }),
  ...targetEvents.flatMap((event): EventCase[] => [
    {
      name: `${event} membership`,
      response: {
        ...eventBase,
        event,
        data: { ...target, object: 'flag_target', rule_id: 'flag_rule_test' },
        context: responseContext,
      },
      expected: {
        data: { ...expectedTarget, ruleId: 'flag_rule_test' },
        context: expectedContext,
      },
    },
    {
      name: `${event} legacy`,
      response: {
        ...eventBase,
        event,
        data: {
          ...target,
          object: 'flag_target',
          value_type: 'boolean',
          value: false,
        },
        context: responseContext,
      },
      expected: {
        data: { ...expectedTarget, valueType: 'boolean', value: false },
        context: expectedContext,
      },
    },
  ]),
  ...[undefined, {}, { data: {} }].map((previous): EventCase => ({
    name: `feature_flags.flag.updated sparse previous ${JSON.stringify(previous)}`,
    response: {
      ...eventBase,
      event: 'feature_flags.flag.updated',
      data: flag,
      context: {
        ...responseContext,
        ...(previous === undefined ? {} : { previous_attributes: previous }),
      },
    },
    expected: {
      data: expectedFlag,
      context: {
        ...expectedContext,
        ...(previous === undefined ? {} : { previousAttributes: previous }),
      },
    },
  })),
];

const workos = new WorkOS('sk_test_feature_flag_events');
const eventNames: EventName[] = cases.map(({ response }) => response.event);

describe('Namespaced feature flag events', () => {
  beforeEach(() => fetch.resetMocks());

  it.each(cases)(
    'listEvents deserializes $name',
    async ({ response, expected }) => {
      fetchOnce({
        object: 'list',
        data: [response],
        list_metadata: { before: null, after: null },
      });
      const result = await workos.events.listEvents({ events: eventNames });
      expect(fetchSearchParams().events).toContain(response.event);
      expect(result.data).toEqual([
        {
          id: 'event_test',
          event: response.event,
          createdAt: timestamps.created_at,
          ...expected,
        },
      ]);
    },
  );

  it.each(cases)(
    'constructEvent verifies and deserializes $name',
    async ({ response, expected }) => {
      const payload = JSON.stringify(response);
      const timestamp = Date.now();
      const secret = 'test_webhook_secret';
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');
      const event = await workos.webhooks.constructEvent({
        payload,
        sigHeader: `t=${timestamp}, v1=${signature}`,
        secret,
      });
      expect(event).toEqual({
        id: 'event_test',
        event: response.event,
        createdAt: timestamps.created_at,
        ...expected,
      });
    },
  );

  const historicalNames: Array<
    'flag.created' | 'flag.updated' | 'flag.deleted' | 'flag.rule_updated'
  > = ['flag.created', 'flag.updated', 'flag.deleted', 'flag.rule_updated'];
  it.each(historicalNames)(
    'preserves historical %s data and context',
    async (name) => {
      const context = {
        client_id: 'client_test',
        actor,
        access_type: 'some',
        configured_targets: { organizations: [], users: [] },
      };
      fetchOnce({
        object: 'list',
        data: [
          {
            id: 'event_test',
            event: name,
            data: { ...flag, description: 'Historical flag' },
            created_at: timestamps.created_at,
            context,
          },
        ],
        list_metadata: { before: null, after: null },
      });
      const result = await workos.events.listEvents({ events: [name] });
      const {
        environmentId: _environmentId,
        owner: _owner,
        ...historicalFlag
      } = expectedFlag;
      expect(result.data).toEqual([
        {
          id: 'event_test',
          event: name,
          createdAt: timestamps.created_at,
          data: { ...historicalFlag, description: 'Historical flag' },
          context,
        },
      ]);
    },
  );
});
