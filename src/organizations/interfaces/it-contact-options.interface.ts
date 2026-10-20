export const ItContactIntent = {
  SSO: 'sso',
  DirectorySync: 'directory_sync',
  LogStreams: 'log_streams',
  DomainVerification: 'domain_verification',
  BringYourOwnKey: 'bring_your_own_key',
} as const;

export type ItContactIntent =
  (typeof ItContactIntent)[keyof typeof ItContactIntent];

export interface ListItContactsOptions {
  /** Unique identifier of the Organization. */
  organizationId: string;
}

export interface CreateItContactOptions {
  /** Unique identifier of the Organization. */
  organizationId: string;
  /** The email address of the IT Contact. */
  email: string;
}

export interface SerializedCreateItContactOptions {
  email: string;
}

export interface DeleteItContactOptions {
  /** Unique identifier of the Organization. */
  organizationId: string;
  /** Unique identifier of the IT Contact. */
  contactId: string;
}

export interface InviteItContactOptions {
  /** Unique identifier of the Organization. */
  organizationId: string;
  /** Unique identifier of the IT Contact. */
  contactId: string;
  /** The Admin Portal features that the IT Contact can configure. */
  intents: ItContactIntent[];
}

export interface SerializedInviteItContactOptions {
  intents: ItContactIntent[];
}

export interface RevokeItContactOptions {
  /** Unique identifier of the Organization. */
  organizationId: string;
  /** Unique identifier of the IT Contact. */
  contactId: string;
}
