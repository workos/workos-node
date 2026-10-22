import {
  MagicAuth,
  MagicAuthEvent,
  MagicAuthEventResponse,
  MagicAuthResponse,
} from '../interfaces/magic-auth.interface';

export const deserializeMagicAuth = (
  magicAuth: MagicAuthResponse,
): MagicAuth => ({
  object: magicAuth.object,
  id: magicAuth.id,
  userId: magicAuth.user_id,
  email: magicAuth.email,
  expiresAt: new Date(magicAuth.expires_at),
  code: magicAuth.code,
  createdAt: new Date(magicAuth.created_at),
  updatedAt: new Date(magicAuth.updated_at),
});

export const deserializeMagicAuthEvent = (
  magicAuth: MagicAuthEventResponse,
): MagicAuthEvent => ({
  object: magicAuth.object,
  id: magicAuth.id,
  userId: magicAuth.user_id,
  email: magicAuth.email,
  expiresAt: new Date(magicAuth.expires_at),
  createdAt: new Date(magicAuth.created_at),
  updatedAt: new Date(magicAuth.updated_at),
});
