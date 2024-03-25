export interface RoleResponse {
  slug: string;
}

export interface RoleEvent {
  object: 'role';
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleEventResponse {
  object: 'role';
  slug: string;
  created_at: string;
  updated_at: string;
}
