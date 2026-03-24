export type VaultActorSource = 'api' | 'dashboard';

export interface VaultActor {
  actorId: string;
  actorSource: VaultActorSource;
  actorName: string;
}

export interface VaultActorResponse {
  actor_id: string;
  actor_source: VaultActorSource;
  actor_name: string;
}

// vault.data.created
export interface VaultDataCreatedEventData extends VaultActor {
  kvName: string;
  keyId: string;
  keyContext: Record<string, string>;
}

export interface VaultDataCreatedEventResponseData extends VaultActorResponse {
  kv_name: string;
  key_id: string;
  key_context: Record<string, string>;
}

// vault.data.updated
export interface VaultDataUpdatedEventData extends VaultActor {
  kvName: string;
  keyId: string;
  keyContext: Record<string, string>;
}

export interface VaultDataUpdatedEventResponseData extends VaultActorResponse {
  kv_name: string;
  key_id: string;
  key_context: Record<string, string>;
}

// vault.data.read
export interface VaultDataReadEventData extends VaultActor {
  kvName: string;
  keyId: string;
}

export interface VaultDataReadEventResponseData extends VaultActorResponse {
  kv_name: string;
  key_id: string;
}

// vault.data.deleted
export interface VaultDataDeletedEventData extends VaultActor {
  kvName: string;
}

export interface VaultDataDeletedEventResponseData extends VaultActorResponse {
  kv_name: string;
}

// vault.metadata.read
export interface VaultMetadataReadEventData extends VaultActor {
  kvName: string;
}

export interface VaultMetadataReadEventResponseData
  extends VaultActorResponse {
  kv_name: string;
}

// vault.names.listed
export type VaultNamesListedEventData = VaultActor;

export type VaultNamesListedEventResponseData = VaultActorResponse;

// vault.kek.created
export interface VaultKekCreatedEventData extends VaultActor {
  keyName: string;
  keyId: string;
}

export interface VaultKekCreatedEventResponseData extends VaultActorResponse {
  key_name: string;
  key_id: string;
}

// vault.dek.read
export interface VaultDekReadEventData extends VaultActor {
  keyIds: string[];
  keyContext: Record<string, string>;
}

export interface VaultDekReadEventResponseData extends VaultActorResponse {
  key_ids: string[];
  key_context: Record<string, string>;
}

// vault.dek.decrypted
export interface VaultDekDecryptedEventData extends VaultActor {
  keyId: string;
}

export interface VaultDekDecryptedEventResponseData
  extends VaultActorResponse {
  key_id: string;
}
