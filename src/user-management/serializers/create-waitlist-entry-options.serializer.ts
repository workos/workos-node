import {
  CreateWaitlistEntryOptions,
  SerializedCreateWaitlistEntryOptions,
} from '../interfaces/create-waitlist-entry-options.interface';

export const serializeCreateWaitlistEntryOptions = (
  options: CreateWaitlistEntryOptions,
): SerializedCreateWaitlistEntryOptions => ({
  email: options.email,
  additional_fields: options.additionalFields,
  send_confirmation_email: options.sendConfirmationEmail,
});
