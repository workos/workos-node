import { User } from '../interfaces/user.interface';

export function getPrimaryEmail(user: User): string | undefined {
  const primaryEmail = user.emails?.find((email) => email.primary);
  return primaryEmail?.value;
}
