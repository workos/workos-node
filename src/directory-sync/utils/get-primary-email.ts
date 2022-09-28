import { UserWithGroups } from '../interfaces/user.interface';

export function getPrimaryEmail(user: UserWithGroups): string | undefined {
  const primaryEmail = (user.emails || []).find((email) => email.primary);
  return primaryEmail && primaryEmail.value;
}
