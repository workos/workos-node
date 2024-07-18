import { Subject, ResourceInterface } from '../interfaces';

export function isSubject(resource: any): resource is Subject {
  return (
    Object.prototype.hasOwnProperty.call(resource, 'resourceType') &&
    Object.prototype.hasOwnProperty.call(resource, 'resourceId')
  );
}

export function isResourceInterface(
  resource: any,
): resource is ResourceInterface {
  return (
    resource.getResourceType !== undefined &&
    resource.getResourceId !== undefined
  );
}
