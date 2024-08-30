import {
  CheckBatchOptions,
  CheckOptions,
  CheckWarrantOptions,
  DecisionTreeNode,
  DecisionTreeNodeResponse,
  SerializedCheckBatchOptions,
  SerializedCheckOptions,
  SerializedCheckWarrantOptions,
} from '../interfaces';
import { isSubject, isResourceInterface } from '../utils/interface-check';

export const serializeCheckOptions = (
  options: CheckOptions,
): SerializedCheckOptions => ({
  op: options.op,
  checks: options.checks.map(serializeCheckWarrantOptions),
  debug: options.debug,
});

export const serializeCheckBatchOptions = (
  options: CheckBatchOptions,
): SerializedCheckBatchOptions => ({
  op: 'batch',
  checks: options.checks.map(serializeCheckWarrantOptions),
  debug: options.debug,
});

const serializeCheckWarrantOptions = (
  warrant: CheckWarrantOptions,
): SerializedCheckWarrantOptions => {
  return {
    resource_type: isResourceInterface(warrant.resource)
      ? warrant.resource.getResourceType()
      : warrant.resource.resourceType,
    resource_id: isResourceInterface(warrant.resource)
      ? warrant.resource.getResourceId()
      : warrant.resource.resourceId
      ? warrant.resource.resourceId
      : '',
    relation: warrant.relation,
    subject: isSubject(warrant.subject)
      ? {
          resource_type: warrant.subject.resourceType,
          resource_id: warrant.subject.resourceId,
        }
      : {
          resource_type: warrant.subject.getResourceType(),
          resource_id: warrant.subject.getResourceId(),
        },
    context: warrant.context ?? {},
  };
};

export const deserializeDecisionTreeNode = (
  response: DecisionTreeNodeResponse,
): DecisionTreeNode => {
  return {
    check: {
      resource: {
        resourceType: response.check.resource_type,
        resourceId: response.check.resource_id,
      },
      relation: response.check.relation,
      subject: {
        resourceType: response.check.subject.resource_type,
        resourceId: response.check.subject.resource_id,
      },
      context: response.check.context,
    },
    policy: response.policy,
    decision: response.decision,
    processingTime: response.processing_time,
    children: response.children.map(deserializeDecisionTreeNode),
  };
};
