import { List, ListResponse } from '../../common/interfaces';
import {
  ReadObjectMetadataResponse,
  ReadObjectResponse,
  UpdateObjectOptions,
  UpdateObjectEntity,
  ObjectMetadata,
  VaultObject,
  ObjectVersionResponse,
  ObjectVersion,
  CreateObjectOptions,
  CreateObjectEntity,
  ObjectDigestResponse,
  ObjectDigest,
  ListObjectVersionsResponse,
} from '../interfaces';

export const deserializeObjectMetadata = (
  metadata: ReadObjectMetadataResponse,
): ObjectMetadata => ({
  context: metadata.context,
  environmentId: metadata.environment_id,
  id: metadata.id,
  keyId: metadata.key_id,
  updatedAt: new Date(Date.parse(metadata.updated_at)),
  updatedBy: metadata.updated_by,
  versionId: metadata.version_id,
});

export const deserializeObject = (object: ReadObjectResponse): VaultObject => ({
  id: object.id,
  name: object.name,
  ...(object.value !== undefined && { value: object.value }),
  metadata: deserializeObjectMetadata(object.metadata),
});

const deserializeObjectDigest = (
  digest: ObjectDigestResponse,
): ObjectDigest => ({
  id: digest.id,
  name: digest.name,
  updatedAt: new Date(Date.parse(digest.updated_at)),
});

export const deserializeListObjects = (
  list: ListResponse<ObjectDigestResponse>,
): List<ObjectDigest> => ({
  object: 'list',
  data: list.data.map(deserializeObjectDigest),
  listMetadata: {
    ...(list.list_metadata.after !== undefined && {
      after: list.list_metadata.after,
    }),
    ...(list.list_metadata.before !== undefined && {
      before: list.list_metadata.before,
    }),
  },
});

export const desrializeListObjectVersions = (
  list: ListObjectVersionsResponse,
): ObjectVersion[] => list.data.map(deserializeObjectVersion);

const deserializeObjectVersion = (
  version: ObjectVersionResponse,
): ObjectVersion => ({
  createdAt: new Date(Date.parse(version.created_at)),
  currentVersion: version.current_version,
  id: version.id,
});

export const serializeCreateObjectEntity = (
  options: CreateObjectOptions,
): CreateObjectEntity => ({
  name: options.name,
  value: options.value,
  key_context: options.context,
});

export const serializeUpdateObjectEntity = (
  options: UpdateObjectOptions,
): UpdateObjectEntity => ({
  value: options.value,
  version_check: options.versionCheck,
});
