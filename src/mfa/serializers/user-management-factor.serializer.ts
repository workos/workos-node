import {
  UserManagementFactor,
  UserManagementFactorResponse,
} from '../interfaces/user-management-factor.interface';
import { deserializeTotp } from './totp.serializer';

export const deserializeUserManagementFactor = (
  factor: UserManagementFactorResponse,
): UserManagementFactor => ({
  object: factor.object,
  id: factor.id,
  createdAt: factor.created_at,
  updatedAt: factor.updated_at,
  type: factor.type,
  totp: deserializeTotp(factor.totp),
  userId: factor.user_id,
});
