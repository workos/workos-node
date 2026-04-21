export interface Group {
  object: 'group';
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupResponse {
  object: 'group';
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
