import { Event, EventResponse } from '../interfaces';

export const deserializeEvent = (event: EventResponse): Event => ({
  id: event.id,
  createdAt: event.created_at,
  data: event.data,
  event: event.event,
});
