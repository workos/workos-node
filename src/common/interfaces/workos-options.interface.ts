import Winston from 'winston';

export interface WorkOSOptions {
  apiHostname?: string;
  https?: boolean;
  port?: number;
  logger?: Winston.Logger;
}
