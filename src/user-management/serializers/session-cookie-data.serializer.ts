import { SessionCookieData } from '../interfaces/authenticate-with-session-cookie.interface';
import { User } from '../interfaces/user.interface';

type SealedUser = Omit<User, 'createdAt' | 'updatedAt' | 'lastSignInAt'> & {
  createdAt: Date | string;
  updatedAt: Date | string;
  lastSignInAt: Date | string | null;
};

/**
 * The shape of a session cookie after it has been unsealed. Sealing goes
 * through JSON, so any `Date` on the stored `User` comes back as an ISO
 * string (and cookies written by older SDK versions stored the API's raw
 * timestamp strings to begin with).
 */
export type SealedSessionCookieData = Omit<SessionCookieData, 'user'> & {
  user: SealedUser;
};

const toDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

export const deserializeSessionCookieData = (
  data: SealedSessionCookieData,
): SessionCookieData => {
  // `unsealData` resolves to `{}` for known seal errors, so `user` can be
  // absent even though the type says otherwise.
  if (!data.user) {
    return data as SessionCookieData;
  }

  return {
    ...data,
    user: {
      ...data.user,
      createdAt: toDate(data.user.createdAt),
      updatedAt: toDate(data.user.updatedAt),
      lastSignInAt:
        data.user.lastSignInAt != null ? toDate(data.user.lastSignInAt) : null,
    },
  };
};
