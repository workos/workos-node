import { ItContact, ItContactResponse } from '../interfaces';

export const deserializeItContact = (
  itContact: ItContactResponse,
): ItContact => ({
  object: itContact.object,
  id: itContact.id,
  email: itContact.email,
  createdAt: itContact.created_at,
  updatedAt: itContact.updated_at,
});
