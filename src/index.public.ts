import { WorkOSBase } from './workos';
import { WorkOSOptions } from './common/interfaces';

// Export public methods directly (new approach)
export * as userManagement from './public/user-management';
export * as sso from './public/sso';

// Re-export types for convenience
export type {
  AuthorizationURLOptions as UserManagementAuthorizationURLOptions,
  LogoutURLOptions,
} from './public/user-management';

export type { SSOAuthorizationURLOptions } from './public/sso';

interface WorkOSPublicOptions {
  clientId?: string;
  apiHostname?: string;
  https?: boolean;
  port?: number;
}

/**
 * WorkOS public-safe SDK for browser environments.
 * Only exposes methods that are safe to use without API keys.
 * @deprecated Use the direct method imports instead:
 * import { userManagement, sso } from '@workos-inc/node/public';
 */
export class WorkOS {
  private _base: WorkOSBase;

  // Client-safe services
  readonly userManagement: {
    authenticateWithCodeAndVerifier: typeof WorkOSBase.prototype.userManagement.authenticateWithCodeAndVerifier;
    getAuthorizationUrl: typeof WorkOSBase.prototype.userManagement.getAuthorizationUrl;
    getLogoutUrl: typeof WorkOSBase.prototype.userManagement.getLogoutUrl;
    getJwksUrl: typeof WorkOSBase.prototype.userManagement.getJwksUrl;
  };

  readonly sso: {
    getAuthorizationUrl: typeof WorkOSBase.prototype.sso.getAuthorizationUrl;
  };

  readonly webhooks: typeof WorkOSBase.prototype.webhooks;
  readonly actions: typeof WorkOSBase.prototype.actions;

  constructor(options: WorkOSPublicOptions = {}) {
    // Convert public options to base WorkOS options format
    const baseOptions: WorkOSOptions = {
      clientId: options.clientId,
      apiHostname: options.apiHostname,
      https: options.https,
      port: options.port,
    };

    // Create base instance without API key
    this._base = new WorkOSBase(undefined, baseOptions);

    // Initialize public-safe service methods
    this.userManagement = {
      authenticateWithCodeAndVerifier:
        this._base.userManagement.authenticateWithCodeAndVerifier.bind(
          this._base.userManagement,
        ),
      getAuthorizationUrl: this._base.userManagement.getAuthorizationUrl.bind(
        this._base.userManagement,
      ),
      getLogoutUrl: this._base.userManagement.getLogoutUrl.bind(
        this._base.userManagement,
      ),
      getJwksUrl: this._base.userManagement.getJwksUrl.bind(
        this._base.userManagement,
      ),
    };

    this.sso = {
      getAuthorizationUrl: this._base.sso.getAuthorizationUrl.bind(
        this._base.sso,
      ),
    };

    // These services are fully public-safe - expose entirely
    this.webhooks = this._base.webhooks;
    this.actions = this._base.actions;
  }

  get version() {
    return this._base.version;
  }
}
