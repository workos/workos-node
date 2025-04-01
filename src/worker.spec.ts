/**
 * @jest-environment miniflare
 */

import { WorkOS } from './index.worker';

test.skip('WorkOS is initialized without errors', () => {
  expect(() => new WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU')).not.toThrow();
});
