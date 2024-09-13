import {
  BatchWriteResourcesOptions,
  CreateResourceOptions,
  DeleteResourceOptions,
  ResourceOp,
  SerializedBatchWriteResourcesOptions,
  SerializedCreateResourceOptions,
  SerializedDeleteResourceOptions,
} from '../interfaces';
import { serializeCreateResourceOptions } from './create-resource-options.serializer';
import { serializeDeleteResourceOptions } from './delete-resource-options.serializer';

export const serializeBatchWriteResourcesOptions = (
  options: BatchWriteResourcesOptions,
): SerializedBatchWriteResourcesOptions => {
  let serializedResources:
    | SerializedCreateResourceOptions[]
    | SerializedDeleteResourceOptions[] = [];
  if (options.op === ResourceOp.Create) {
    const resources = options.resources as CreateResourceOptions[];
    serializedResources = resources.map((options: CreateResourceOptions) =>
      serializeCreateResourceOptions(options),
    );
  } else if (options.op === ResourceOp.Delete) {
    const resources = options.resources as DeleteResourceOptions[];
    serializedResources = resources.map((options: DeleteResourceOptions) =>
      serializeDeleteResourceOptions(options),
    );
  }

  return {
    op: options.op,
    resources: serializedResources,
  };
};
