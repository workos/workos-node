export interface CreateGroupOptions {
  organizationId: string;
  name: string;
  description?: string | null;
}

export interface SerializedCreateGroupOptions {
  name: string;
  description?: string | null;
}
