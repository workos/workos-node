export interface Permission {
  object: 'permission';
  id: string;
  slug: string;
  name: string;
  description: string | null;
  resourceTypeSlug: string;
  system: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionResponse {
  object: 'permission';
  id: string;
  slug: string;
  name: string;
  description: string | null;
  resource_type_slug: string;
  system: boolean;
  created_at: string;
  updated_at: string;
}
