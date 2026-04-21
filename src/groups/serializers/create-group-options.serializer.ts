import {
  CreateGroupOptions,
  SerializedCreateGroupOptions,
} from '../interfaces';

export const serializeCreateGroupOptions = (
  options: CreateGroupOptions,
): SerializedCreateGroupOptions => ({
  name: options.name,
  description: options.description,
});
