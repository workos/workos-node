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

      const subject = await workos.featureFlags.getFeatureFlag(
        'advanced-dashboard',
      );

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

      const subject = await workos.featureFlags.enableFeatureFlag(
        'advanced-dashboard',
      );

      expect(fetchURL()).toContain('/feature-flags/advanced-dashboard/enable');
      expect(fetchMethod()).toBe('PUT');
      expect(subject.enabled).toBe(true);
    });
  });

  describe('disableFeatureFlag', () => {
    it('disables a feature flag by slug', async () => {
      fetchOnce(disableFeatureFlagFixture);

      const subject = await workos.featureFlags.disableFeatureFlag(
        'advanced-dashboard',
      );

      expect(fetchURL()).toContain('/feature-flags/advanced-dashboard/disable');
      expect(fetchMethod()).toBe('PUT');
      expect(subject.enabled).toBe(false);
    });
  });

  describe('addFlagTarget', () => {
    it('adds a target to a feature flag', async () => {
      fetchOnce({}, { status: 204 });

      await workos.featureFlags.addFlagTarget(
        'advanced-dashboard',
        'user_01EHQMYV6MBK39QC5PZXHY59C5',
      );

      expect(fetchURL()).toContain(
        '/feature-flags/advanced-dashboard/targets/user_01EHQMYV6MBK39QC5PZXHY59C5',
      );
      expect(fetchMethod()).toBe('POST');
    });

    it('adds an organization target to a feature flag', async () => {
      fetchOnce({}, { status: 204 });

      await workos.featureFlags.addFlagTarget(
        'advanced-dashboard',
        'org_01EHQMYV6MBK39QC5PZXHY59C5',
      );

      expect(fetchURL()).toContain(
        '/feature-flags/advanced-dashboard/targets/org_01EHQMYV6MBK39QC5PZXHY59C5',
      );
      expect(fetchMethod()).toBe('POST');
    });
  });

  describe('removeFlagTarget', () => {
    it('removes a target from a feature flag', async () => {
      fetchOnce({}, { status: 204 });

      await workos.featureFlags.removeFlagTarget(
        'advanced-dashboard',
        'user_01EHQMYV6MBK39QC5PZXHY59C5',
      );

      expect(fetchURL()).toContain(
        '/feature-flags/advanced-dashboard/targets/user_01EHQMYV6MBK39QC5PZXHY59C5',
      );
      expect(fetchMethod()).toBe('DELETE');
    });

    it('removes an organization target from a feature flag', async () => {
      fetchOnce({}, { status: 204 });

      await workos.featureFlags.removeFlagTarget(
        'advanced-dashboard',
        'org_01EHQMYV6MBK39QC5PZXHY59C5',
      );

      expect(fetchURL()).toContain(
        '/feature-flags/advanced-dashboard/targets/org_01EHQMYV6MBK39QC5PZXHY59C5',
      );
      expect(fetchMethod()).toBe('DELETE');
    });
  });
});
