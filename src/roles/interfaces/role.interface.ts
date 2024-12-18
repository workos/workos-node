export interface RoleResponse<TRole extends string = string> {
  slug: TRole;
}

export interface RoleEvent<TRole extends string = string> {
  object: 'role';
  slug: TRole;
}

export interface RoleEventResponse<TRole extends string = string> {
  object: 'role';
  slug: TRole;
}
