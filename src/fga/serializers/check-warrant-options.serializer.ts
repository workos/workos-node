import {
  CheckManyOptions,
  CheckOp,
  CheckOptions,
  CheckWarrantOptions,
  SerializedCheck,
  SerializedCheckWarrant,
} from '../interfaces';
import { isSubject, isWarrantObject } from '../utils/interface-check';

export const serializeCheckOptions = (
  checkOptions: CheckOptions,
): SerializedCheck => ({
  warrants: [serializeCheckWarrantOptions(checkOptions)],
  debug: checkOptions.debug,
});

export const serializeCheckManyOptions = (
  checkManyOptions: CheckManyOptions,
): SerializedCheck => ({
  op: checkManyOptions.op,
  warrants: checkManyOptions.warrants.map(serializeCheckWarrantOptions),
  debug: checkManyOptions.debug,
});

export const serializeBatchCheckOptions = (
  batchCheckOptions: CheckManyOptions,
): SerializedCheck => ({
  op: CheckOp.Batch,
  warrants: batchCheckOptions.warrants.map(serializeCheckWarrantOptions),
  debug: batchCheckOptions.debug,
});

const serializeCheckWarrantOptions = (
  warrant: CheckWarrantOptions,
): SerializedCheckWarrant => {
  return {
    object_type: isWarrantObject(warrant.object)
      ? warrant.object.getObjectType()
      : warrant.object.objectType,
    object_id: isWarrantObject(warrant.object)
      ? warrant.object.getObjectId()
      : warrant.object.objectId
      ? warrant.object.objectId
      : '',
    relation: warrant.relation,
    subject: isSubject(warrant.subject)
      ? {
          object_type: warrant.subject.objectType,
          object_id: warrant.subject.objectId,
        }
      : {
          object_type: warrant.subject.getObjectType(),
          object_id: warrant.subject.getObjectId(),
        },
    context: warrant.context ? warrant.context : {},
  };
};
