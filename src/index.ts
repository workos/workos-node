import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { CryptoProvider } from './common/crypto/crypto-provider';

import { HttpClient } from './common/net/http-client';
import { FetchHttpClient } from './common/net/fetch-client';

import { Actions } from './actions/actions';
import { Webhooks } from './webhooks/webhooks';
import { WorkOS } from './workos';
import { WorkOSOptions } from './common/interfaces';

export * from './actions/interfaces';
export * from './audit-logs/interfaces';
export * from './common/exceptions';
export * from './common/interfaces';
export * from './common/utils/pagination';
export * from './directory-sync/interfaces';
export * from './events/interfaces';
export * from './feature-flags/interfaces';
export * from './fga/interfaces';
export * from './organizations/interfaces';
export * from './organization-domains/interfaces';
export * from './passwordless/interfaces';
export * from './portal/interfaces';
export * from './roles/interfaces';
export * from './sso/interfaces';
export * from './user-management/interfaces';
export * from './vault/interfaces';
export * from './pkce/pkce';

class WorkOSNode extends WorkOS {
  /** @override */
  createHttpClient(options: WorkOSOptions, userAgent: string): HttpClient {
    const headers: Record<string, string> = {
      'User-Agent': userAgent,
    };

    // Merge config headers if they exist and are a plain object
    const configHeaders = options.config?.headers;
    if (
      configHeaders &&
      typeof configHeaders === 'object' &&
      !Array.isArray(configHeaders) &&
      !(configHeaders instanceof Headers)
    ) {
      Object.assign(headers, configHeaders);
    }

    // Only add Authorization if we have an API key
    if (this.key) {
      headers['Authorization'] = `Bearer ${this.key}`;
    }

    const opts = {
      ...options.config,
      timeout: options.timeout,
      headers,
    };

    return new FetchHttpClient(this.baseURL, opts, options.fetchFn);
  }

  /** @override */
  createWebhookClient(): Webhooks {
    return new Webhooks(this.getCryptoProvider());
  }

  override getCryptoProvider(): CryptoProvider {
    return new SubtleCryptoProvider();
  }

  /** @override */
  createActionsClient(): Actions {
    return new Actions(this.getCryptoProvider());
  }

  /** @override */
  emitWarning(warning: string): void {
    return process.emitWarning(warning, 'WorkOS');
  }
}

export { WorkOSNode as WorkOS };
