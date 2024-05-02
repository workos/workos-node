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
  expiresAt: magicAuth.expires_at,
  code: magicAuth.code,
  createdAt: magicAuth.created_at,
  updatedAt: magicAuth.updated_at,
});

export const deserializeMagicAuthEvent = (
  magicAuth: MagicAuthEventResponse,
): MagicAuthEvent => ({
  object: magicAuth.object,
  id: magicAuth.id,
  userId: magicAuth.user_id,
  email: magicAuth.email,
  expiresAt: magicAuth.expires_at,
  createdAt: magicAuth.created_at,
  updatedAt: magicAuth.updated_at,
});
