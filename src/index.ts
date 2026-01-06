import { NodeCryptoProvider } from './common/crypto/node-crypto-provider';
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { CryptoProvider } from './common/crypto/crypto-provider';

import { HttpClient } from './common/net/http-client';
import { FetchHttpClient } from './common/net/fetch-client';
import { NodeHttpClient } from './common/net/node-client';

import { Actions } from './actions/actions';
import { Webhooks } from './webhooks/webhooks';
import { WorkOS } from './workos';
import { WorkOSOptions } from './common/interfaces';
import { WebIronSessionProvider } from './common/iron-session/web-iron-session-provider';
import { IronSessionProvider } from './common/iron-session/iron-session-provider';

export * from './actions/interfaces';
export * from './api-keys/interfaces';
export * from './audit-logs/interfaces';
export * from './common/exceptions';
export * from './common/interfaces';
export * from './common/utils/pagination';
export * from './directory-sync/interfaces';
export * from './directory-sync/utils/get-primary-email';
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

class WorkOSNode extends WorkOS {
  /** @override */
  createHttpClient(options: WorkOSOptions, userAgent: string): HttpClient {
    const opts = {
      ...options.config,
      timeout: options.timeout, // Pass through the timeout option
      headers: {
        ...options.config?.headers,
        Authorization: `Bearer ${this.key}`,
        'User-Agent': userAgent,
      },
    };

    if (
      typeof fetch !== 'undefined' ||
      typeof options.fetchFn !== 'undefined'
    ) {
      return new FetchHttpClient(this.baseURL, opts, options.fetchFn);
    } else {
      return new NodeHttpClient(this.baseURL, opts);
    }
  }

  /** @override */
  createWebhookClient(): Webhooks {
    return new Webhooks(this.getCryptoProvider());
  }

  override getCryptoProvider(): CryptoProvider {
    let cryptoProvider: CryptoProvider;

    if (typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined') {
      cryptoProvider = new SubtleCryptoProvider();
    } else {
      cryptoProvider = new NodeCryptoProvider();
    }

    return cryptoProvider;
  }

  /** @override */
  createActionsClient(): Actions {
    return new Actions(this.getCryptoProvider());
  }

  /** @override */
  createIronSessionProvider(): IronSessionProvider {
    return new WebIronSessionProvider();
  }

  /** @override */
  emitWarning(warning: string): void {
    return process.emitWarning(warning, 'WorkOS');
  }
}

export { WorkOSNode as WorkOS };
