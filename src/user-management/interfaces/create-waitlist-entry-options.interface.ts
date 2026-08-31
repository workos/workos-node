export interface CreateWaitlistEntryOptions {
  /** The email address of the user joining the waitlist. */
  email: string;
  /** Additional key/value pairs collected with the waitlist entry. Supports up to 50 string pairs, with keys up to 40 characters and values up to 600 characters. */
  additionalFields?: Record<string, string>;
  /** Whether to send the waitlist confirmation email to the user. Defaults to `false`. No email is sent when the waitlist confirmation email is disabled in the environment, even if `sendConfirmationEmail` is `true`. */
  sendConfirmationEmail?: boolean;
}

export interface SerializedCreateWaitlistEntryOptions {
  email: string;
  additional_fields?: Record<string, string>;
  send_confirmation_email?: boolean;
}
