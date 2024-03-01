export interface OrganizationMembership {
  object: 'organization_membership';
  id: string;
  organizationId: string;
  status: 'active' | 'pending';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembershipResponse {
  object: 'organization_membership';
  id: string;
  organization_id: string;
  status: 'active' | 'pending';
  user_id: string;
  created_at: string;
  updated_at: string;
}
