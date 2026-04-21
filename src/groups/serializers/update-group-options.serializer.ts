import {
  SerializedUpdateGroupOptions,
  UpdateGroupOptions,
} from '../interfaces';

export const serializeUpdateGroupOptions = (
  options: Omit<UpdateGroupOptions, 'organizationId' | 'groupId'>,
): SerializedUpdateGroupOptions => ({
  name: options.name,
  description: options.description,
});
