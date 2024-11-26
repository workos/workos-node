import { Actions } from './actions/actions';
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { EdgeIronSessionProvider } from './common/iron-session/edge-iron-session-provider';
import { IronSessionProvider } from './common/iron-session/iron-session-provider';
import { FetchHttpClient } from './common/net/fetch-client';
import { HttpClient } from './common/net/http-client';
import { WorkOSOptions } from './index.worker';
import { Webhooks } from './webhooks/webhooks';
import { WorkOS } from './workos';

export * from './audit-logs/interfaces';
export * from './common/exceptions';
export * from './common/interfaces';
export * from './common/utils/pagination';
export * from './directory-sync/interfaces';
export * from './directory-sync/utils/get-primary-email';
export * from './events/interfaces';
export * from './organizations/interfaces';
export * from './passwordless/interfaces';
export * from './portal/interfaces';
export * from './sso/interfaces';
export * from './user-management/interfaces';

class WorkOSWorker extends WorkOS {
  /** @override */
  createHttpClient(options: WorkOSOptions, userAgent: string): HttpClient {
    return new FetchHttpClient(this.baseURL, {
      ...options.config,
      headers: {
        ...options.config?.headers,
        Authorization: `Bearer ${this.key}`,
        'User-Agent': userAgent,
      },
    });
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
  createIronSessionProvider(): IronSessionProvider {
    return new EdgeIronSessionProvider();
  }

  /** @override */
  emitWarning(warning: string): void {
    // tslint:disable-next-line:no-console
    return console.warn(`WorkOS: ${warning}`);
  }
}

export { WorkOSWorker as WorkOS };
