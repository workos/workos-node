import { Subject, ResourceInterface } from '../interfaces';

export function isSubject(resource: any): resource is Subject {
  return (
    Object.prototype.hasOwnProperty.call(resource, 'resourceType') &&
    Object.prototype.hasOwnProperty.call(resource, 'resourceId')
  );
}

export function isResourceInterface(
  resource: unknown,
): resource is ResourceInterface {
  return (
    !!resource &&
    typeof resource === 'object' &&
    'getResouceType' in resource &&
    'getResourceId' in resource
  );
}
