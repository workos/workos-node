export interface UpdateGroupOptions {
  organizationId: string;
  groupId: string;
  name?: string;
  description?: string | null;
}

export interface SerializedUpdateGroupOptions {
  name?: string;
  description?: string | null;
}
