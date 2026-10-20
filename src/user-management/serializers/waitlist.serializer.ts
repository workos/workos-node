import { Waitlist, WaitlistResponse } from '../interfaces/waitlist.interface';

export const deserializeWaitlist = (waitlist: WaitlistResponse): Waitlist => ({
  object: waitlist.object,
  id: waitlist.id,
  createdAt: waitlist.created_at,
  updatedAt: waitlist.updated_at,
});
