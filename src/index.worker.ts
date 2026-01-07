import { Actions } from './actions/actions';
import { CryptoProvider } from './common/crypto/crypto-provider';
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { FetchHttpClient } from './common/net/fetch-client';
import { HttpClient } from './common/net/http-client';
import { WorkOSOptions } from './index.worker';
import { Webhooks } from './webhooks/webhooks';
import { WorkOS } from './workos';

export * from './actions/interfaces';
export * from './audit-logs/interfaces';
export * from './common/exceptions';
export * from './common/interfaces';
export * from './common/utils/pagination';
export * from './directory-sync/interfaces';
export * from './events/interfaces';
export * from './fga/interfaces';
export * from './organizations/interfaces';
export * from './organization-domains/interfaces';
export * from './passwordless/interfaces';
export * from './portal/interfaces';
export * from './sso/interfaces';
export * from './user-management/interfaces';
export * from './roles/interfaces';
export * from './pkce/pkce';

class WorkOSWorker extends WorkOS {
  /** @override */
  createHttpClient(options: WorkOSOptions, userAgent: string): HttpClient {
    const headers: Record<string, string> = {
      'User-Agent': userAgent,
    };

    const configHeaders = options.config?.headers;
    if (
      configHeaders &&
      typeof configHeaders === 'object' &&
      !Array.isArray(configHeaders) &&
      !(configHeaders instanceof Headers)
    ) {
      Object.assign(headers, configHeaders);
    }

    if (this.key) {
      headers['Authorization'] = `Bearer ${this.key}`;
    }

    return new FetchHttpClient(this.baseURL, {
      ...options.config,
      headers,
    });
  }

  /** @override */
  createWebhookClient(): Webhooks {
    const cryptoProvider = new SubtleCryptoProvider();

    return new Webhooks(cryptoProvider);
  }

  override getCryptoProvider(): CryptoProvider {
    return new SubtleCryptoProvider();
  }

  /** @override */
  createActionsClient(): Actions {
    const cryptoProvider = new SubtleCryptoProvider();

    return new Actions(cryptoProvider);
  }

  /** @override */
  emitWarning(warning: string): void {
    // tslint:disable-next-line:no-console
    return console.warn(`WorkOS: ${warning}`);
  }
}

export { WorkOSWorker as WorkOS };
