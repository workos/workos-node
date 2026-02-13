import fetch from 'jest-fetch-mock';
import { fetchOnce, fetchURL } from '../common/utils/test-utils';
import { UnauthorizedException } from '../common/exceptions';
import { WorkOS } from '../workos';
import { FeatureFlagsRuntimeClient } from './runtime-client';
import { FlagPollResponse } from './interfaces';

const workos = new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');

const pollResponse: FlagPollResponse = {
  'flag-a': {
    slug: 'flag-a',
    enabled: true,
    default_value: true,
    targets: { users: [], organizations: [] },
  },
  'flag-b': {
    slug: 'flag-b',
    enabled: true,
    default_value: false,
    targets: {
      users: [{ id: 'user_123', enabled: true }],
      organizations: [],
    },
  },
};

describe('FeatureFlagsRuntimeClient', () => {
  beforeEach(() => {
    fetch.resetMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function createClientAndWait(
    options?: Parameters<typeof workos.featureFlags.createRuntimeClient>[0],
  ): FeatureFlagsRuntimeClient {
    fetchOnce(pollResponse);
    const client = workos.featureFlags.createRuntimeClient(options);
    return client;
  }

  describe('polling', () => {
    it('starts polling on construction', async () => {
      const client = createClientAndWait();

      // First poll happens immediately in constructor
      await jest.advanceTimersByTimeAsync(0);
      expect(fetchURL()).toContain('/sdk/feature-flags');

      client.close();
    });

    it('schedules subsequent polls', async () => {
      const client = createClientAndWait();
      await jest.advanceTimersByTimeAsync(0);

      // Queue up second poll response
      fetchOnce(pollResponse);
      await jest.advanceTimersByTimeAsync(35_000);

      expect(fetch.mock.calls.length).toBe(2);

      client.close();
    });
  });

  describe('waitUntilReady', () => {
    it('resolves after first successful poll', async () => {
      const client = createClientAndWait();

      let resolved = false;
      client.waitUntilReady().then(() => {
        resolved = true;
      });

      await jest.advanceTimersByTimeAsync(0);
      // Allow microtasks to flush
      await Promise.resolve();
      expect(resolved).toBe(true);

      client.close();
    });

    it('resolves immediately with bootstrap flags', async () => {
      fetchOnce(pollResponse);
      const client = workos.featureFlags.createRuntimeClient({
        bootstrapFlags: pollResponse,
      });

      // waitUntilReady should resolve immediately since bootstrap flags were provided
      await client.waitUntilReady();

      // Handle the poll that fires in constructor
      await jest.advanceTimersByTimeAsync(0);

      client.close();
    });

    it('rejects after timeoutMs', async () => {
      // Don't provide a fetch response so the poll hangs
      fetch.mockResponseOnce(
        () => new Promise(() => {}), // never resolves
      );
      const client = workos.featureFlags.createRuntimeClient({
        requestTimeoutMs: 50,
      });

      // Suppress error events from the client
      client.on('error', () => {});

      const promise = client.waitUntilReady({ timeoutMs: 100 });

      // Use synchronous timer advancement to avoid async rejection propagation
      jest.advanceTimersByTime(150);

      await expect(promise).rejects.toThrow('waitUntilReady timed out');

      client.close();
    });
  });

  describe('close', () => {
    it('stops polling', async () => {
      const client = createClientAndWait();
      await jest.advanceTimersByTimeAsync(0);

      client.close();

      fetchOnce(pollResponse);
      await jest.advanceTimersByTimeAsync(60_000);

      // Only the initial poll should have happened
      expect(fetch.mock.calls.length).toBe(1);
    });
  });

  describe('isEnabled', () => {
    it('evaluates flags from the store', async () => {
      const client = createClientAndWait();
      await jest.advanceTimersByTimeAsync(0);
      await client.waitUntilReady();

      expect(client.isEnabled('flag-a')).toBe(true);
      expect(client.isEnabled('flag-b')).toBe(false);
      expect(client.isEnabled('flag-b', { userId: 'user_123' })).toBe(true);
      expect(client.isEnabled('unknown')).toBe(false);
      expect(client.isEnabled('unknown', {}, true)).toBe(true);

      client.close();
    });
  });

  describe('getAllFlags', () => {
    it('evaluates all flags', async () => {
      const client = createClientAndWait();
      await jest.advanceTimersByTimeAsync(0);
      await client.waitUntilReady();

      expect(client.getAllFlags()).toEqual({
        'flag-a': true,
        'flag-b': false,
      });

      expect(client.getAllFlags({ userId: 'user_123' })).toEqual({
        'flag-a': true,
        'flag-b': true,
      });

      client.close();
    });
  });

  describe('getFlag', () => {
    it('returns raw flag entry', async () => {
      const client = createClientAndWait();
      await jest.advanceTimersByTimeAsync(0);
      await client.waitUntilReady();

      expect(client.getFlag('flag-a')).toEqual(pollResponse['flag-a']);
      expect(client.getFlag('unknown')).toBeUndefined();

      client.close();
    });
  });

  describe('getStats', () => {
    it('returns accurate stats after polling', async () => {
      const client = createClientAndWait();
      await jest.advanceTimersByTimeAsync(0);
      await client.waitUntilReady();

      const stats = client.getStats();

      expect(stats.pollCount).toBe(1);
      expect(stats.pollErrorCount).toBe(0);
      expect(stats.lastPollAt).toBeInstanceOf(Date);
      expect(stats.lastSuccessfulPollAt).toBeInstanceOf(Date);
      expect(stats.flagCount).toBe(2);
      expect(typeof stats.cacheAge).toBe('number');

      client.close();
    });
  });

  describe('options', () => {
    it('clamps pollingIntervalMs to minimum of 5000', async () => {
      const client = createClientAndWait({ pollingIntervalMs: 1000 });
      await jest.advanceTimersByTimeAsync(0);

      // Should not fire a second poll at 2s
      fetchOnce(pollResponse);
      await jest.advanceTimersByTimeAsync(2000);
      expect(fetch.mock.calls.length).toBe(1);

      // Should fire by 6s (5000 + jitter)
      await jest.advanceTimersByTimeAsync(4000);
      expect(fetch.mock.calls.length).toBe(2);

      client.close();
    });
  });

  describe('change events', () => {
    it('does not emit change events on first poll', async () => {
      const changes: unknown[] = [];

      const client = createClientAndWait();
      client.on('change', (change) => changes.push(change));

      await jest.advanceTimersByTimeAsync(0);
      await client.waitUntilReady();

      expect(changes).toEqual([]);

      client.close();
    });

    it('emits change events when flags change', async () => {
      const client = createClientAndWait();
      await jest.advanceTimersByTimeAsync(0);
      await client.waitUntilReady();

      const changes: unknown[] = [];
      client.on('change', (change) => changes.push(change));

      const updatedResponse: FlagPollResponse = {
        'flag-a': {
          slug: 'flag-a',
          enabled: false,
          default_value: true,
          targets: { users: [], organizations: [] },
        },
        'flag-b': pollResponse['flag-b'],
      };

      fetchOnce(updatedResponse);
      await jest.advanceTimersByTimeAsync(35_000);

      expect(changes).toEqual([
        {
          key: 'flag-a',
          previous: pollResponse['flag-a'],
          current: updatedResponse['flag-a'],
        },
      ]);

      client.close();
    });

    it('emits change when a flag is removed', async () => {
      const client = createClientAndWait();
      await jest.advanceTimersByTimeAsync(0);
      await client.waitUntilReady();

      const changes: unknown[] = [];
      client.on('change', (change) => changes.push(change));

      // Second poll returns only flag-a
      fetchOnce({ 'flag-a': pollResponse['flag-a'] });
      await jest.advanceTimersByTimeAsync(35_000);

      expect(changes).toEqual([
        {
          key: 'flag-b',
          previous: pollResponse['flag-b'],
          current: null,
        },
      ]);

      client.close();
    });
  });

  describe('bootstrap flags', () => {
    it('first poll replaces bootstrap data', async () => {
      const bootstrapFlags: FlagPollResponse = {
        'bootstrap-flag': {
          slug: 'bootstrap-flag',
          enabled: true,
          default_value: true,
          targets: { users: [], organizations: [] },
        },
      };

      fetchOnce(pollResponse);
      const client = workos.featureFlags.createRuntimeClient({
        bootstrapFlags,
      });

      // Bootstrap data is available immediately
      expect(client.isEnabled('bootstrap-flag')).toBe(true);
      expect(client.isEnabled('flag-a')).toBe(false);

      // First poll replaces bootstrap data with API response
      await jest.advanceTimersByTimeAsync(0);

      expect(client.isEnabled('bootstrap-flag')).toBe(false);
      expect(client.isEnabled('flag-a')).toBe(true);
      expect(client.getStats().flagCount).toBe(2);

      client.close();
    });
  });

  describe('error handling', () => {
    it('emits error on poll failure and continues polling', async () => {
      // First poll fails
      fetch.mockRejectOnce(new Error('Network error'));

      const client = workos.featureFlags.createRuntimeClient();

      const errors: unknown[] = [];
      client.on('error', (err) => errors.push(err));

      await jest.advanceTimersByTimeAsync(0);
      expect(errors.length).toBe(1);

      // Continues polling — second poll succeeds
      fetchOnce(pollResponse);
      await jest.advanceTimersByTimeAsync(35_000);

      expect(client.getStats().pollCount).toBe(2);
      expect(client.getStats().pollErrorCount).toBe(1);

      client.close();
    });

    it('emits failed and stops polling on 401', async () => {
      fetchOnce(
        { message: 'Unauthorized' },
        { status: 401, headers: { 'X-Request-ID': 'req_123' } },
      );

      const client = workos.featureFlags.createRuntimeClient();

      const errors: unknown[] = [];
      const failures: unknown[] = [];
      client.on('error', (err) => errors.push(err));
      client.on('failed', (err) => failures.push(err));

      await jest.advanceTimersByTimeAsync(0);

      expect(errors.length).toBe(1);
      expect(failures.length).toBe(1);
      expect(failures[0]).toBeInstanceOf(UnauthorizedException);

      // Should not schedule another poll
      fetchOnce(pollResponse);
      await jest.advanceTimersByTimeAsync(60_000);

      expect(fetch.mock.calls.length).toBe(1);

      client.close();
    });
  });
});
