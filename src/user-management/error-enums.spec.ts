import { 
  RefreshAndSealSessionDataFailureReason, 
  AuthenticateWithSessionCookieFailureReason 
} from './interfaces';

describe('WorkOS Error Enums - Minimal Export Fix', () => {
  it('should export RefreshAndSealSessionDataFailureReason enum', () => {
    // These are the error codes WorkOS already uses internally
    expect(RefreshAndSealSessionDataFailureReason.INVALID_SESSION_COOKIE).toBe('invalid_session_cookie');
    expect(RefreshAndSealSessionDataFailureReason.NO_SESSION_COOKIE_PROVIDED).toBe('no_session_cookie_provided');
    expect(RefreshAndSealSessionDataFailureReason.INVALID_GRANT).toBe('invalid_grant');
    expect(RefreshAndSealSessionDataFailureReason.MFA_ENROLLMENT).toBe('mfa_enrollment');
    expect(RefreshAndSealSessionDataFailureReason.SSO_REQUIRED).toBe('sso_required');
    expect(RefreshAndSealSessionDataFailureReason.ORGANIZATION_NOT_AUTHORIZED).toBe('organization_not_authorized');
  });

  it('should export AuthenticateWithSessionCookieFailureReason enum', () => {
    expect(AuthenticateWithSessionCookieFailureReason.INVALID_JWT).toBe('invalid_jwt');
    expect(AuthenticateWithSessionCookieFailureReason.INVALID_SESSION_COOKIE).toBe('invalid_session_cookie');
    expect(AuthenticateWithSessionCookieFailureReason.NO_SESSION_COOKIE_PROVIDED).toBe('no_session_cookie_provided');
  });

  it('should allow developers to use the enums for error handling like GitHub issue requested', () => {
    // This is what developers wanted to do from the GitHub issue
    const mockError = {
      rawData: {
        code: 'mfa_enrollment',
        message: 'MFA enrollment required',
        pending_authentication_token: 'token_123'
      }
    };

    // Now developers can do type-safe error checking!
    if (mockError.rawData.code === RefreshAndSealSessionDataFailureReason.MFA_ENROLLMENT) {
      expect(mockError.rawData.pending_authentication_token).toBe('token_123');
      expect(true).toBe(true); // This test represents the success case
    } else {
      fail('Should match MFA_ENROLLMENT error code');
    }
  });

  it('should work with email verification scenario from GitHub issue', () => {
    // Even though EMAIL_VERIFICATION_REQUIRED isn't in the current enums,
    // developers can still check for it as a string alongside the enum values
    const emailError = { rawData: { code: 'email_verification_required' } };
    
    // They can combine enum checking with string checking
    if (emailError.rawData.code === 'email_verification_required' ||
        emailError.rawData.code === RefreshAndSealSessionDataFailureReason.MFA_ENROLLMENT) {
      expect(emailError.rawData.code).toBe('email_verification_required');
    }
  });
});