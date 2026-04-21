import fetch from 'jest-fetch-mock';
import {
  fetchOnce,
  fetchURL,
  fetchSearchParams,
  fetchMethod,
} from '../common/utils/test-utils';
import { WorkOS } from '../workos';
import listFeatureFlagsFixture from './fixtures/list-feature-flags.json';
import getFeatureFlagFixture from './fixtures/get-feature-flag.json';
import enableFeatureFlagFixture from './fixtures/enable-feature-flag.json';
import disableFeatureFlagFixture from './fixtures/disable-feature-flag.json';
import listOrganizationFeatureFlagsFixture from './fixtures/list-organization-feature-flags.json';
import listUserFeatureFlagsFixture from './fixtures/list-user-feature-flags.json';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

describe('FeatureFlags', () => {
  beforeEach(() => fetch.resetMocks());

  describe('listFeatureFlags', () => {
    describe('without any options', () => {
      it('returns feature flags and metadata', async () => {
        fetchOnce(listFeatureFlagsFixture);

        const { data, listMetadata } =
          await workos.featureFlags.listFeatureFlags();

        expect(fetchSearchParams()).toEqual({
          order: 'desc',
        });
        expect(fetchURL()).toContain('/feature-flags');

        expect(data).toHaveLength(3);
        expect(data[0]).toEqual({
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C5',
          name: 'Advanced Dashboard',
          slug: 'advanced-dashboard',
          description: 'Enable advanced dashboard features',
          tags: ['ui'],
          enabled: true,
          defaultValue: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        });

        expect(listMetadata).toEqual({
          before: null,
          after: 'flag_01EHQMYV6MBK39QC5PZXHY59C7',
        });
      });
    });

    describe('with the before option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listFeatureFlagsFixture);

        const { data } = await workos.featureFlags.listFeatureFlags({
          before: 'flag_before_id',
        });

        expect(fetchSearchParams()).toEqual({
          before: 'flag_before_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain('/feature-flags');
        expect(data).toHaveLength(3);
      });
    });

    describe('with the after option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listFeatureFlagsFixture);

        const { data } = await workos.featureFlags.listFeatureFlags({
          after: 'flag_after_id',
        });

        expect(fetchSearchParams()).toEqual({
          after: 'flag_after_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain('/feature-flags');
        expect(data).toHaveLength(3);
      });
    });

    describe('with the limit option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listFeatureFlagsFixture);

        const { data } = await workos.featureFlags.listFeatureFlags({
          limit: 10,
        });

        expect(fetchSearchParams()).toEqual({
          limit: '10',
          order: 'desc',
        });

        expect(fetchURL()).toContain('/feature-flags');
        expect(data).toHaveLength(3);
      });
    });
  });

  describe('getFeatureFlag', () => {
    it('requests a feature flag by slug', async () => {
      fetchOnce(getFeatureFlagFixture);

      const subject =
        await workos.featureFlags.getFeatureFlag('advanced-dashboard');

      expect(fetchURL()).toContain('/feature-flags/advanced-dashboard');
      expect(subject).toEqual({
        object: 'feature_flag',
        id: 'flag_01EHQMYV6MBK39QC5PZXHY59C5',
        name: 'Advanced Dashboard',
        slug: 'advanced-dashboard',
        description: 'Enable advanced dashboard features',
        tags: ['ui'],
        enabled: true,
        defaultValue: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('enableFeatureFlag', () => {
    it('enables a feature flag by slug', async () => {
      fetchOnce(enableFeatureFlagFixture);

      const subject =
        await workos.featureFlags.enableFeatureFlag('advanced-dashboard');

      expect(fetchURL()).toContain('/feature-flags/advanced-dashboard/enable');
      expect(fetchMethod()).toBe('PUT');
      expect(subject.enabled).toBe(true);
    });
  });

  describe('disableFeatureFlag', () => {
    it('disables a feature flag by slug', async () => {
      fetchOnce(disableFeatureFlagFixture);

      const subject =
        await workos.featureFlags.disableFeatureFlag('advanced-dashboard');

      expect(fetchURL()).toContain('/feature-flags/advanced-dashboard/disable');
      expect(fetchMethod()).toBe('PUT');
      expect(subject.enabled).toBe(false);
    });
  });

  describe('addFlagTarget', () => {
    it('adds a target to a feature flag', async () => {
      fetchOnce({}, { status: 204 });

      await workos.featureFlags.addFlagTarget({
        slug: 'advanced-dashboard',
        targetId: 'user_01EHQMYV6MBK39QC5PZXHY59C5',
      });

      expect(fetchURL()).toContain(
        '/feature-flags/advanced-dashboard/targets/user_01EHQMYV6MBK39QC5PZXHY59C5',
      );
      expect(fetchMethod()).toBe('POST');
    });

    it('adds an organization target to a feature flag', async () => {
      fetchOnce({}, { status: 204 });

      await workos.featureFlags.addFlagTarget({
        slug: 'advanced-dashboard',
        targetId: 'org_01EHQMYV6MBK39QC5PZXHY59C5',
      });

      expect(fetchURL()).toContain(
        '/feature-flags/advanced-dashboard/targets/org_01EHQMYV6MBK39QC5PZXHY59C5',
      );
      expect(fetchMethod()).toBe('POST');
    });
  });

  describe('removeFlagTarget', () => {
    it('removes a target from a feature flag', async () => {
      fetchOnce({}, { status: 204 });

      await workos.featureFlags.removeFlagTarget({
        slug: 'advanced-dashboard',
        targetId: 'user_01EHQMYV6MBK39QC5PZXHY59C5',
      });

      expect(fetchURL()).toContain(
        '/feature-flags/advanced-dashboard/targets/user_01EHQMYV6MBK39QC5PZXHY59C5',
      );
      expect(fetchMethod()).toBe('DELETE');
    });

    it('removes an organization target from a feature flag', async () => {
      fetchOnce({}, { status: 204 });

      await workos.featureFlags.removeFlagTarget({
        slug: 'advanced-dashboard',
        targetId: 'org_01EHQMYV6MBK39QC5PZXHY59C5',
      });

      expect(fetchURL()).toContain(
        '/feature-flags/advanced-dashboard/targets/org_01EHQMYV6MBK39QC5PZXHY59C5',
      );
      expect(fetchMethod()).toBe('DELETE');
    });
  });

  describe('listOrganizationFeatureFlags', () => {
    it('returns feature flags for the organization', async () => {
      fetchOnce(listOrganizationFeatureFlagsFixture);

      const { data, object, listMetadata } =
        await workos.featureFlags.listOrganizationFeatureFlags({
          organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        });

      expect(fetchURL()).toContain(
        '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/feature-flags',
      );

      expect(object).toEqual('list');
      expect(listMetadata).toEqual({});
      expect(data).toHaveLength(3);
      expect(data).toEqual([
        {
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C5',
          name: 'Advanced Dashboard',
          slug: 'advanced-dashboard',
          description: 'Enable advanced dashboard features',
          tags: ['ui'],
          enabled: true,
          defaultValue: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C6',
          name: 'Beta Features',
          slug: 'beta-features',
          description: '',
          tags: [],
          enabled: false,
          defaultValue: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C7',
          name: 'Premium Support',
          slug: 'premium-support',
          description: 'Access to premium support features',
          tags: ['dev-support'],
          enabled: false,
          defaultValue: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]);
    });

    describe('with the before option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationFeatureFlagsFixture);

        const { data } = await workos.featureFlags.listOrganizationFeatureFlags(
          {
            organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            before: 'flag_before_id',
          },
        );

        expect(fetchSearchParams()).toEqual({
          before: 'flag_before_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/feature-flags',
        );

        expect(data).toHaveLength(3);
      });
    });

    describe('with the after option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationFeatureFlagsFixture);

        const { data } = await workos.featureFlags.listOrganizationFeatureFlags(
          {
            organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            after: 'flag_after_id',
          },
        );

        expect(fetchSearchParams()).toEqual({
          after: 'flag_after_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/feature-flags',
        );

        expect(data).toHaveLength(3);
      });
    });

    describe('with the limit option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listOrganizationFeatureFlagsFixture);

        const { data } = await workos.featureFlags.listOrganizationFeatureFlags(
          {
            organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
            limit: 10,
          },
        );

        expect(fetchSearchParams()).toEqual({
          limit: '10',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          '/organizations/org_01EHT88Z8J8795GZNQ4ZP1J81T/feature-flags',
        );

        expect(data).toHaveLength(3);
      });
    });

    describe('autoPagination', () => {
      it('does not include organizationId in pagination query params', async () => {
        const fixtureWithAfter = {
          ...listOrganizationFeatureFlagsFixture,
          list_metadata: {
            after: 'flag_next_page',
          },
        };
        fetchOnce(fixtureWithAfter);
        fetchOnce(fixtureWithAfter);
        fetchOnce(listOrganizationFeatureFlagsFixture);

        const result = await workos.featureFlags.listOrganizationFeatureFlags({
          organizationId: 'org_01EHT88Z8J8795GZNQ4ZP1J81T',
        });

        await result.autoPagination();

        const thirdCallUrl = fetch.mock.calls[2][0];
        const thirdCallParams = Object.fromEntries(
          new URL(String(thirdCallUrl)).searchParams,
        );
        expect(thirdCallParams).not.toHaveProperty('organizationId');
        expect(thirdCallParams).toHaveProperty('after', 'flag_next_page');
      });
    });
  });

  describe('listUserFeatureFlags', () => {
    const userId = 'user_01H5JQDV7R7ATEYZDEG0W5PRYS';

    it('returns feature flags for the user', async () => {
      fetchOnce(listUserFeatureFlagsFixture);

      const { data, object, listMetadata } =
        await workos.featureFlags.listUserFeatureFlags({ userId });

      expect(fetchURL()).toContain(
        `/user_management/users/${userId}/feature-flags`,
      );

      expect(object).toEqual('list');
      expect(listMetadata).toEqual({});
      expect(data).toHaveLength(3);
      expect(data).toEqual([
        {
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C5',
          name: 'Advanced Dashboard',
          slug: 'advanced-dashboard',
          description: 'Enable advanced dashboard features',
          tags: ['ui'],
          enabled: true,
          defaultValue: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C6',
          name: 'Beta Features',
          slug: 'beta-features',
          description: '',
          tags: [],
          enabled: false,
          defaultValue: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          object: 'feature_flag',
          id: 'flag_01EHQMYV6MBK39QC5PZXHY59C7',
          name: 'Premium Support',
          slug: 'premium-support',
          description: 'Access to premium support features',
          tags: ['dev-support'],
          enabled: false,
          defaultValue: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]);
    });

    describe('with the before option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listUserFeatureFlagsFixture);

        const { data } = await workos.featureFlags.listUserFeatureFlags({
          userId,
          before: 'flag_before_id',
        });

        expect(fetchSearchParams()).toEqual({
          before: 'flag_before_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          `/user_management/users/${userId}/feature-flags`,
        );

        expect(data).toHaveLength(3);
      });
    });

    describe('with the after option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listUserFeatureFlagsFixture);

        const { data } = await workos.featureFlags.listUserFeatureFlags({
          userId,
          after: 'flag_after_id',
        });

        expect(fetchSearchParams()).toEqual({
          after: 'flag_after_id',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          `/user_management/users/${userId}/feature-flags`,
        );

        expect(data).toHaveLength(3);
      });
    });

    describe('with the limit option', () => {
      it('forms the proper request to the API', async () => {
        fetchOnce(listUserFeatureFlagsFixture);

        const { data } = await workos.featureFlags.listUserFeatureFlags({
          userId,
          limit: 3,
        });

        expect(fetchSearchParams()).toEqual({
          limit: '3',
          order: 'desc',
        });

        expect(fetchURL()).toContain(
          `/user_management/users/${userId}/feature-flags`,
        );

        expect(data).toHaveLength(3);
      });
    });
  });
});
