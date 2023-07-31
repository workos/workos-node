import { DirectoryUser } from '../interfaces/directory-user.interface';

export function getPrimaryEmail(user: DirectoryUser): string | undefined {
  const primaryEmail = user.emails?.find((email) => email.primary);
  return primaryEmail?.value;
}
