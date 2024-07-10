import { BaseWarrantObject, WarrantObjectResponse } from '../interfaces';

export const deserializeBaseWarrantObject = (
  warrantObject: WarrantObjectResponse,
): BaseWarrantObject => ({
  objectType: warrantObject.object_type,
  objectId: warrantObject.object_id,
  meta: warrantObject.meta,
});
