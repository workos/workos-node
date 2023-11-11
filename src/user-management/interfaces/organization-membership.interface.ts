export interface OrganizationMembership {
  object: 'organization_membership';
  id: string;
  organizationId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembershipResponse {
  object: 'organization_membership';
  id: string;
  organization_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
