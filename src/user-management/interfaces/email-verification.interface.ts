type EmailVerificationStatus =
  | {
      status: 'succeeded';
    }
  | {
      status: 'failed';
      error: {
        code: string;
        message: string;
      };
    };

export type EmailVerification = {
  object: 'email_verification';
  email: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string | null;
} & EmailVerificationStatus;

export type EmailVerificationResponse = {
  object: 'email_verification';
  email: string;
  ip_address: string | null;
  user_agent: string | null;
  user_id: string | null;
} & EmailVerificationStatus;
