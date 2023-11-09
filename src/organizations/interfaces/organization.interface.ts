export interface Organization {
  object: 'organization';
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationResponse {
  object: 'organization';
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
