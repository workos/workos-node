import {
  DeleteObjectOptions,
  SerializedDeleteObjectOptions,
} from '../interfaces';
import { isWarrantObject } from '../utils/interface-check';

export const serializeDeleteObjectOptions = (
  object: DeleteObjectOptions,
): SerializedDeleteObjectOptions => ({
  object_type: isWarrantObject(object)
    ? object.getObjectType()
    : object.objectType,
  object_id: isWarrantObject(object)
    ? object.getObjectId()
    : object.objectId
    ? object.objectId
    : '',
});
