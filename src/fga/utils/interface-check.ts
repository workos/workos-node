import { Subject, WarrantObject } from "../interfaces";

export function isSubject(object: any): object is Subject {
  return Object.prototype.hasOwnProperty.call(object, "objectType")
    && Object.prototype.hasOwnProperty.call(object, "objectId")
}

export function isWarrantObject(object: any): object is WarrantObject {
  return object.getObjectType !== undefined && object.getObjectId !== undefined;
}
