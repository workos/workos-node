import {
  CreateWaitlistUserOptions,
  SerializedCreateWaitlistUserOptions,
} from '../interfaces/create-waitlist-user-options.interface';

export const serializeCreateWaitlistUserOptions = (
  options: CreateWaitlistUserOptions,
): SerializedCreateWaitlistUserOptions => ({
  email: options.email,
  additional_fields: options.additionalFields,
  notify: options.notify,
});
