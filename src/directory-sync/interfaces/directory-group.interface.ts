export interface DirectoryGroup {
  id: string;
  idp_id: string;
  directory_id: string;
  organization_id: string | null;
  name: string;
  created_at: string;
  updated_at: string;
  raw_attributes: any;
}
