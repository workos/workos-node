// @oagen-ignore-file
import { Actions } from './actions/actions';
import { CryptoProvider } from './common/crypto/crypto-provider';
import { SubtleCryptoProvider } from './common/crypto/subtle-crypto-provider';
import { Webhooks } from './webhooks/webhooks';
import { WorkOS } from './workos';

export * from './actions/interfaces';
export * from './audit-logs/interfaces';
export * from './authorization/interfaces';
export * from './common/exceptions';
export * from './common/interfaces';
export * from './common/utils/pagination';
export * from './directory-sync/interfaces';
export * from './events/interfaces';
export * from './organizations/interfaces';
export * from './organization-domains/interfaces';
export * from './passwordless/interfaces';
export * from './admin-portal/interfaces';
export * from './sso/interfaces';
export * from './user-management/interfaces';
export * from './roles/interfaces';
export * from './pkce/pkce';
export {
  createWorkOS,
  type PublicWorkOS,
  type PublicUserManagement,
  type PublicSSO,
  type PublicClientOptions,
  type ConfidentialClientOptions,
} from './factory';

class WorkOSWorker extends WorkOS {
  /** @override */
  createWebhookClient(): Webhooks {
    return new Webhooks(this);
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
