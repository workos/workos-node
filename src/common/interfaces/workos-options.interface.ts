import { AppInfo } from './app-info.interface';

export interface WorkOSOptions {
  apiHostname?: string;
  ekmHostname?: string;
  https?: boolean;
  port?: number;
  ekmPort?: number;
  config?: RequestInit;
  appInfo?: AppInfo;
  fetchFn?: typeof fetch;
  clientId?: string;
}
