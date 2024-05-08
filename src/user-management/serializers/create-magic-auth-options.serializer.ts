import {
  CreateMagicAuthOptions,
  SerializedCreateMagicAuthOptions,
} from '../interfaces';

export const serializeCreateMagicAuthOptions = (
  options: CreateMagicAuthOptions,
): SerializedCreateMagicAuthOptions => ({
  email: options.email,
  invitation_token: options.invitationToken,
});
