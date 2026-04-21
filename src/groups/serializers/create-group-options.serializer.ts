import {
  CreateGroupOptions,
  SerializedCreateGroupOptions,
} from '../interfaces';

export const serializeCreateGroupOptions = (
  options: Omit<CreateGroupOptions, 'organizationId'>,
): SerializedCreateGroupOptions => ({
  name: options.name,
  description: options.description,
});
