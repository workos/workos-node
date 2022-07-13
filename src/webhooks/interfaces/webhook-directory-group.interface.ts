export interface WebhookDirectoryGroup<TRawAttributes = any> {
  id: string;
  idp_id: string;
  directory_id: string;
  organization_id: string | null;
  name: string;
  created_at: string;
  updated_at: string;
  raw_attributes: TRawAttributes;
}
