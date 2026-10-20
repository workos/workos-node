import {
  CreateItContactOptions,
  InviteItContactOptions,
  SerializedCreateItContactOptions,
  SerializedInviteItContactOptions,
} from '../interfaces';

export const serializeCreateItContactOptions = (
  options: Omit<CreateItContactOptions, 'organizationId'>,
): SerializedCreateItContactOptions => ({
  email: options.email,
});

export const serializeInviteItContactOptions = (
  options: Omit<InviteItContactOptions, 'organizationId' | 'contactId'>,
): SerializedInviteItContactOptions => ({
  intents: options.intents,
});
