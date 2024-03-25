import { EmailVerification, EmailVerificationResponse } from '../interfaces';

export const deserializeEmailVerification = (
  emailVerification: EmailVerificationResponse,
): EmailVerification => {
  const common = {
    object: 'email_verification',
    email: emailVerification.email,
    ipAddress: emailVerification.ip_address,
    userAgent: emailVerification.user_agent,
    userId: emailVerification.user_id,
  } as const;

  if (emailVerification.status === 'failed') {
    return {
      ...common,
      status: emailVerification.status,
      error: emailVerification.error,
    };
  }

  return {
    ...common,
    status: emailVerification.status,
  };
};
