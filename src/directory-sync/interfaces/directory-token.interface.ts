export interface DirectoryToken {
  object: 'directory_token';
  id: string;
  directoryId: string;
  organizationId?: string;
  tokenSuffix: string;
  createdAt: Date;
}

export interface DirectoryTokenResponse {
  object: 'directory_token';
  id: string;
  directory_id: string;
  organization_id?: string;
  token_suffix: string;
  created_at: string;
}
