import {
  WarrantObject,
  WarrantObjectLiteral,
} from './warrant-object.interface';
import { PolicyContext, SerializedSubject, Subject } from './warrant.interface';
import { CheckOp } from './check-op.enum';
import { PostOptions } from '../../common/interfaces';

export interface CheckWarrantOptions {
  object: WarrantObject | WarrantObjectLiteral;
  relation: string;
  subject: WarrantObject | Subject;
  context?: PolicyContext;
}

export interface CheckOptions extends CheckWarrantOptions {
  debug?: boolean;
}

export interface CheckManyOptions {
  op?: CheckOp;
  warrants: CheckWarrantOptions[];
  debug?: boolean;
}

export interface BatchCheckOptions {
  warrants: CheckWarrantOptions[];
  debug?: boolean;
}

export interface CheckWarrant {
  objectType: string;
  objectId: string;
  relation: string;
  subject: Subject;
  context: PolicyContext;
}

export interface SerializedCheckWarrant {
  object_type: string;
  object_id: string;
  relation: string;
  subject: SerializedSubject;
  context: PolicyContext;
}

export interface Check {
  op?: CheckOp;
  warrants: CheckWarrant[];
  debug?: boolean;
}

export interface SerializedCheck {
  op?: CheckOp;
  warrants: SerializedCheckWarrant[];
  debug?: boolean;
}

export interface CheckResultInterface {
  code: number;
  result: string;
  isImplicit: boolean;
}

export class CheckResult implements CheckResultInterface {
  public code: number;
  public result: string;
  public isImplicit: boolean;

  constructor(json: CheckResultInterface) {
    this.code = json.code;
    this.result = json.result;
    this.isImplicit = json.isImplicit;
  }

  isAuthorized(): boolean {
    return this.result === 'Authorized';
  }
}

export type CheckRequestOptions = Pick<PostOptions, 'warrantToken'>;
