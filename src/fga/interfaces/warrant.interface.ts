import { GetOptions } from '../../common/interfaces';
import {
  WarrantObject,
  WarrantObjectLiteral,
} from './warrant-object.interface';
import { WarrantOp } from './warrant-op.enum';

export interface ListWarrantsOptions {
  objectType?: string;
  objectId?: string;
  relation?: string;
  subjectType?: string;
  subjectId?: string;
  subjectRelation?: string;
  limit?: number;
  after?: string;
}

export interface SerializedListWarrantsOptions {
  object_type?: string;
  object_id?: string;
  relation?: string;
  subject_type?: string;
  subject_id?: string;
  subject_relation?: string;
  limit?: number;
  after?: string;
}

export interface PolicyContext {
  [key: string]: any;
}

export interface Subject {
  objectType: string;
  objectId: string;
  relation?: string;
}

export interface SerializedSubject {
  object_type: string;
  object_id: string;
  relation?: string;
}

export interface Warrant {
  objectType: string;
  objectId: string;
  relation: string;
  subject: Subject;
  policy?: string;
}

export interface WriteWarrantOptions {
  op?: WarrantOp;
  object: WarrantObject | WarrantObjectLiteral;
  relation: string;
  subject: WarrantObject | Subject;
  policy?: string;
}

export interface SerializedWriteWarrantOptions {
  op?: WarrantOp;
  object_type: string;
  object_id: string;
  relation: string;
  subject: SerializedSubject;
  policy?: string;
}

export type ListWarrantsRequestsOptions = Pick<GetOptions, 'warrantToken'>;

export interface WarrantResponse {
  object_type: string;
  object_id: string;
  relation: string;
  subject: SerializedSubject;
}
