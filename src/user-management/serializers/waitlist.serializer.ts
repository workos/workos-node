import { Waitlist, WaitlistResponse } from '../interfaces/waitlist.interface';

export const deserializeWaitlist = (waitlist: WaitlistResponse): Waitlist => ({
  object: waitlist.object,
  id: waitlist.id,
  createdAt: new Date(waitlist.created_at),
  updatedAt: new Date(waitlist.updated_at),
});
