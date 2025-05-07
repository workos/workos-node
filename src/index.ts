import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';

import { FetchHttpClient } from './common/net/fetch-client';
import { HttpClient } from './common/net/http-client';
import { NodeHttpClient } from './common/net/node-client';

import { Actions } from './actions/actions';
import { WorkOSOptions } from './common/interfaces';
import { Webhooks } from './webhooks/webhooks';
import { WorkOS } from './workos';

export * from './actions/interfaces';
export * from './audit-logs/interfaces';
export * from './common/exceptions';
export * from './common/interfaces';
export * from './common/utils/pagination';
export * from './directory-sync/interfaces';
export * from './directory-sync/utils/get-primary-email';
export * from './events/interfaces';
export * from './fga/interfaces';
export * from './organization-domains/interfaces';
export * from './organizations/interfaces';
export * from './passwordless/interfaces';
export * from './portal/interfaces';
export * from './roles/interfaces';
export * from './sso/interfaces';
export * from './user-management/interfaces';

class WorkOSNode extends WorkOS {
  /** @override */
  createHttpClient(options: WorkOSOptions, userAgent: string): HttpClient {
    const opts = {
      ...options.config,
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
    const cryptoProvider = new SubtleCryptoProvider();
    return new Webhooks(cryptoProvider);
  }

  /** @override */
  createActionsClient(): Actions {
    const cryptoProvider = new SubtleCryptoProvider();

    return new Actions(cryptoProvider);
  }

  /** @override */
  emitWarning(warning: string): void {
    return process.emitWarning(warning, 'WorkOS');
  }
}

export { WorkOSNode as WorkOS };
