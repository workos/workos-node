import {
  WaitlistUser,
  WaitlistUserResponse,
} from '../interfaces/waitlist-user.interface';

export const deserializeWaitlistUser = (
  waitlistUser: WaitlistUserResponse,
): WaitlistUser => ({
  object: waitlistUser.object,
  id: waitlistUser.id,
  email: waitlistUser.email,
  state: waitlistUser.state,
  approvedAt: waitlistUser.approved_at,
  waitlistId: waitlistUser.waitlist_id ?? null,
  createdAt: waitlistUser.created_at,
  updatedAt: waitlistUser.updated_at,
});
