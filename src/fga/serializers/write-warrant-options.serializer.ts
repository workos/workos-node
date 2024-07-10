import { SerializedWriteWarrantOptions, WriteWarrantOptions } from "../interfaces";
import { isSubject, isWarrantObject } from "../utils/interface-check";

export const serializeWriteWarrantOptions = (
  warrant: WriteWarrantOptions,
): SerializedWriteWarrantOptions => ({
  op: warrant.op,
  object_type: isWarrantObject(warrant.object) ? warrant.object.getObjectType() : warrant.object.objectType,
  object_id: isWarrantObject(warrant.object) ? warrant.object.getObjectId() : (warrant.object.objectId ? warrant.object.objectId : ""),
  relation: warrant.relation,
  subject: isSubject(warrant.subject) ? { object_type: warrant.subject.objectType, object_id: warrant.subject.objectId } : { object_type: warrant.subject.getObjectType(), object_id: warrant.subject.getObjectId() },
  policy: warrant.policy,
})
