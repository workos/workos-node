import {
  SendMagicAuthCodeOptions,
  SerializedSendMagicAuthCodeOptions,
} from '../interfaces';

export const serializeSendMagicAuthCodeOptions = (
  options: SendMagicAuthCodeOptions,
): SerializedSendMagicAuthCodeOptions => ({
  email: options.email,
});
