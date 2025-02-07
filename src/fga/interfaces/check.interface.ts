import { ResourceInterface, ResourceOptions } from './resource.interface';
import { PolicyContext, SerializedSubject, Subject } from './warrant.interface';
import { CheckOp } from './check-op.enum';
import { PostOptions } from '../../common/interfaces';
import { deserializeDecisionTreeNode } from '../serializers/check-options.serializer';

const CHECK_RESULT_AUTHORIZED = 'authorized';

export interface CheckWarrantOptions {
  resource: ResourceInterface | ResourceOptions;
  relation: string;
  subject: ResourceInterface | Subject;
  context?: PolicyContext;
}

export interface SerializedCheckWarrantOptions {
  resource_type: string;
  resource_id: string;
  relation: string;
  subject: SerializedSubject;
  context: PolicyContext;
}

export interface CheckOptions {
  op?: CheckOp;
  checks: CheckWarrantOptions[];
  debug?: boolean;
}

export interface CheckBatchOptions {
  checks: CheckWarrantOptions[];
  debug?: boolean;
}

export interface SerializedCheckOptions {
  op?: CheckOp;
  checks: SerializedCheckWarrantOptions[];
  debug?: boolean;
}

export interface SerializedCheckBatchOptions {
  op: 'batch';
  checks: SerializedCheckWarrantOptions[];
  debug?: boolean;
}

export interface CheckResultResponse {
  result: string;
  is_implicit: boolean;
  warrant_token: string;
  debug_info?: DebugInfoResponse;
}

export interface DebugInfo {
  processingTime: number;
  decisionTree: DecisionTreeNode;
}

export interface DecisionTreeNode {
  check: CheckWarrantOptions;
  policy?: string;
  decision: string;
  processingTime: number;
  children: DecisionTreeNode[];
}

export interface DebugInfoResponse {
  processing_time: number;
  decision_tree: DecisionTreeNodeResponse;
}

export interface DecisionTreeNodeResponse {
  check: SerializedCheckWarrantOptions;
  policy?: string;
  decision: string;
  processing_time: number;
  children: DecisionTreeNodeResponse[];
}

export interface CheckResultInterface {
  result: string;
  isImplicit: boolean;
  warrantToken: string;
  debugInfo?: DebugInfo;
}

export class CheckResult implements CheckResultInterface {
  public result: string;
  public isImplicit: boolean;
  public warrantToken: string;
  public debugInfo?: DebugInfo;

  constructor(json: CheckResultResponse) {
    this.result = json.result;
    this.isImplicit = json.is_implicit;
    this.warrantToken = json.warrant_token;
    this.debugInfo = json.debug_info
      ? {
          processingTime: json.debug_info.processing_time,
          decisionTree: deserializeDecisionTreeNode(
            json.debug_info.decision_tree,
          ),
        }
      : undefined;
  }

  isAuthorized(): boolean {
    return this.result === CHECK_RESULT_AUTHORIZED;
  }
}

export type CheckRequestOptions = Pick<PostOptions, 'warrantToken'>;
