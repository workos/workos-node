export interface WebhookDirectoryGroup<TRawAttributes = any> {
  id: string;
  idp_id: string;
  directory_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  raw_attributes: TRawAttributes;
}
