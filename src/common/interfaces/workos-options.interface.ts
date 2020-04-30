import Stream from 'stream';

export interface WorkOSOptions {
  apiHostname?: string;
  https?: boolean;
  port?: number;
  logger?: Stream.Transform;
}
