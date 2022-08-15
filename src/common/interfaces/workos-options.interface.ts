import { AxiosRequestConfig } from 'axios';

export interface WorkOSOptions {
  apiHostname?: string;
  https?: boolean;
  port?: number;
  axios?: Pick<AxiosRequestConfig, 'adapter' | 'httpsAgent' | 'proxy'>;
}
