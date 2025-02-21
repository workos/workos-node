import { AppInfo } from './app-info.interface';

export interface WorkOSOptions {
  apiHostname?: string;
  vaultHostname?: string;
  https?: boolean;
  port?: number;
  vaultPort?: number;
  config?: RequestInit;
  appInfo?: AppInfo;
  fetchFn?: typeof fetch;
  clientId?: string;
}
