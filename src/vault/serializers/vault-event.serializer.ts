import {
  VaultActorResponse,
  VaultActor,
  VaultDataCreatedEventData,
  VaultDataCreatedEventResponseData,
  VaultDataUpdatedEventData,
  VaultDataUpdatedEventResponseData,
  VaultDataReadEventData,
  VaultDataReadEventResponseData,
  VaultDataDeletedEventData,
  VaultDataDeletedEventResponseData,
  VaultMetadataReadEventData,
  VaultMetadataReadEventResponseData,
  VaultNamesListedEventData,
  VaultNamesListedEventResponseData,
  VaultKekCreatedEventData,
  VaultKekCreatedEventResponseData,
  VaultDekReadEventData,
  VaultDekReadEventResponseData,
  VaultDekDecryptedEventData,
  VaultDekDecryptedEventResponseData,
  VaultByokKeyVerificationCompletedEventData,
  VaultByokKeyVerificationCompletedEventResponseData,
} from '../interfaces/vault-event.interface';

const deserializeVaultActor = (actor: VaultActorResponse): VaultActor => ({
  actorId: actor.actor_id,
  actorSource: actor.actor_source,
  actorName: actor.actor_name,
});

export const deserializeVaultDataCreatedEvent = (
  data: VaultDataCreatedEventResponseData,
): VaultDataCreatedEventData => ({
  ...deserializeVaultActor(data),
  kvName: data.kv_name,
  keyId: data.key_id,
  keyContext: data.key_context,
});

export const deserializeVaultDataUpdatedEvent = (
  data: VaultDataUpdatedEventResponseData,
): VaultDataUpdatedEventData => ({
  ...deserializeVaultActor(data),
  kvName: data.kv_name,
  keyId: data.key_id,
  keyContext: data.key_context,
});

export const deserializeVaultDataReadEvent = (
  data: VaultDataReadEventResponseData,
): VaultDataReadEventData => ({
  ...deserializeVaultActor(data),
  kvName: data.kv_name,
  keyId: data.key_id,
});

export const deserializeVaultDataDeletedEvent = (
  data: VaultDataDeletedEventResponseData,
): VaultDataDeletedEventData => ({
  ...deserializeVaultActor(data),
  kvName: data.kv_name,
});

export const deserializeVaultMetadataReadEvent = (
  data: VaultMetadataReadEventResponseData,
): VaultMetadataReadEventData => ({
  ...deserializeVaultActor(data),
  kvName: data.kv_name,
});

export const deserializeVaultNamesListedEvent = (
  data: VaultNamesListedEventResponseData,
): VaultNamesListedEventData => deserializeVaultActor(data);

export const deserializeVaultKekCreatedEvent = (
  data: VaultKekCreatedEventResponseData,
): VaultKekCreatedEventData => ({
  ...deserializeVaultActor(data),
  keyName: data.key_name,
  keyId: data.key_id,
});

export const deserializeVaultDekReadEvent = (
  data: VaultDekReadEventResponseData,
): VaultDekReadEventData => ({
  ...deserializeVaultActor(data),
  keyIds: data.key_ids,
  keyContext: data.key_context,
});

export const deserializeVaultDekDecryptedEvent = (
  data: VaultDekDecryptedEventResponseData,
): VaultDekDecryptedEventData => ({
  ...deserializeVaultActor(data),
  keyId: data.key_id,
});

export const deserializeVaultByokKeyVerificationCompletedEvent = (
  data: VaultByokKeyVerificationCompletedEventResponseData,
): VaultByokKeyVerificationCompletedEventData => ({
  organizationId: data.organization_id,
  keyProvider: data.key_provider,
  verified: data.verified,
});
