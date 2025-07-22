import {
  ListSessionsOptions,
  SerializedListSessionsOptions,
} from '../interfaces/list-sessions-options.interface';

export const serializeListSessionsOptions = (
  options: ListSessionsOptions,
): SerializedListSessionsOptions => ({
  ...options,
});
