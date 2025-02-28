/**
 * @jest-environment miniflare
 */
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { FetchHttpClient } from './common/net';
import { WorkOS } from './index.worker';

describe('WorkOS in Worker environment', () => {
  let workos: WorkOS;

  beforeEach(() => {
    workos = new WorkOS('sk_test_key');
  });

  test('initializes without errors', () => {
    expect(workos).toBeInstanceOf(WorkOS);
  });

  test('uses FetchHttpClient', () => {
    // @ts-ignore - accessing private property for testing
    expect(workos['client']).toBeInstanceOf(FetchHttpClient);
  });

  test('uses SubtleCryptoProvider', () => {
    // @ts-ignore - accessing private property for testing
    expect(
      workos.webhooks['signatureProvider']['cryptoProvider'],
    ).toBeInstanceOf(SubtleCryptoProvider);
  });

  // Add more tests for core API functionality
});
