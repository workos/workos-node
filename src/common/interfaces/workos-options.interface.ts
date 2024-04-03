import { AppInfo } from './app-info.interface';

export interface WorkOSOptions {
  apiHostname?: string;
  https?: boolean;
  port?: number;
  config?: RequestInit;
  appInfo?: AppInfo;
}
