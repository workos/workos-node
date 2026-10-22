import {
  WaitlistEntry,
  WaitlistEntryResponse,
} from '../interfaces/waitlist-entry.interface';

export const deserializeWaitlistEntry = (
  waitlistEntry: WaitlistEntryResponse,
): WaitlistEntry => ({
  object: waitlistEntry.object,
  id: waitlistEntry.id,
  email: waitlistEntry.email,
  state: waitlistEntry.state,
  approvedAt:
    waitlistEntry.approved_at != null
      ? new Date(waitlistEntry.approved_at)
      : null,
  additionalFields: waitlistEntry.additional_fields,
  waitlistId: waitlistEntry.waitlist_id ?? null,
  createdAt: new Date(waitlistEntry.created_at),
  updatedAt: new Date(waitlistEntry.updated_at),
});
