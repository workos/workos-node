import { ItContact, ItContactResponse } from '../interfaces';

export const deserializeItContact = (
  itContact: ItContactResponse,
): ItContact => ({
  object: itContact.object,
  id: itContact.id,
  email: itContact.email,
  createdAt: new Date(itContact.created_at),
  updatedAt: new Date(itContact.updated_at),
});
