import { AppInfo } from './app-info.interface';

export interface WorkOSOptions {
  apiKey?: string;
  apiHostname?: string;
  https?: boolean;
  port?: number;
  config?: RequestInit;
  appInfo?: AppInfo;
  fetchFn?: typeof fetch;
  clientId?: string;
  timeout?: number; // Timeout in milliseconds
}
