import {
  CreateObjectOptions,
  SerializedCreateObjectOptions,
} from '../interfaces';
import { isWarrantObject } from '../utils/interface-check';

export const serializeCreateObjectOptions = (
  objectOptions: CreateObjectOptions,
): SerializedCreateObjectOptions => ({
  object_type: isWarrantObject(objectOptions.object)
    ? objectOptions.object.getObjectType()
    : objectOptions.object.objectType,
  object_id: isWarrantObject(objectOptions.object)
    ? objectOptions.object.getObjectId()
    : objectOptions.object.objectId
    ? objectOptions.object.objectId
    : '',
  meta: objectOptions.meta,
});
