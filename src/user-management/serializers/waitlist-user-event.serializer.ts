import {
  WaitlistUserEventData,
  WaitlistUserEventResponseData,
} from '../interfaces/waitlist-user-event.interface';

export const deserializeWaitlistUserEvent = (
  data: WaitlistUserEventResponseData,
): WaitlistUserEventData => ({
  object: data.object,
  id: data.id,
  email: data.email,
  state: data.state,
  approvedAt: data.approved_at != null ? new Date(data.approved_at) : null,
  additionalFields: data.additional_fields,
  waitlistId: data.waitlist_id ?? null,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});
