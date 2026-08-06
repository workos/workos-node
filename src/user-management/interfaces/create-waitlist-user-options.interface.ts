export interface CreateWaitlistUserOptions {
  /** The email address of the user joining the waitlist. */
  email: string;
  /** Additional key/value pairs stored with the waitlist user. Not returned by the API. */
  additionalFields?: Record<string, string>;
  /** Whether to send the waitlist confirmation email. Defaults to false. */
  notify?: boolean;
}

export interface SerializedCreateWaitlistUserOptions {
  email: string;
  additional_fields?: Record<string, string>;
  notify?: boolean;
}
