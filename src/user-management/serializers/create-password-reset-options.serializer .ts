import {
  CreatePasswordResetOptions,
  SerializedCreatePasswordResetOptions,
} from '../interfaces';

export const serializeCreatePasswordResetOptions = (
  options: CreatePasswordResetOptions,
): SerializedCreatePasswordResetOptions => ({
  email: options.email,
});
