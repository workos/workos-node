export interface Organization {
  object: 'organization';
  id: string;
  name: string;
  allowProfilesOutsideOrganization: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationResponse {
  object: 'organization';
  id: string;
  name: string;
  allow_profiles_outside_organization: boolean;
  created_at: string;
  updated_at: string;
}
