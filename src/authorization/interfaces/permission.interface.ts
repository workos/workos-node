export interface Permission {
  object: 'permission';
  id: string;
  slug: string;
  name: string;
  description: string | null;
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
  system: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionList {
  object: 'list';
  data: Permission[];
  listMetadata: {
    before: string | null;
    after: string | null;
  };
}

export interface PermissionListResponse {
  object: 'list';
  data: PermissionResponse[];
  list_metadata: {
    before: string | null;
    after: string | null;
  };
}
