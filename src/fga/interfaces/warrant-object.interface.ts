import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export interface WarrantObject {
  getObjectType(): string;
  getObjectId(): string;
}

export interface WarrantObjectLiteral {
  objectType: string;
  objectId?: string;
}

export interface SerializedWarrantObject {
  object_type: string;
  object_id?: string;
}

export interface CreateObjectOptions {
  object: WarrantObject | WarrantObjectLiteral;
  meta?: { [key: string]: any };
}

export interface SerializedCreateObjectOptions {
  object_type: string;
  object_id?: string;
  meta?: { [key: string]: any };
}

export type GetObjectOptions = WarrantObject | WarrantObjectLiteral;

export interface ListObjectOptions extends PaginationOptions {
  objectType?: string;
  search?: string;
}

export interface SerializedListObjectOptions extends PaginationOptions {
  object_type?: string;
  search?: string;
}

export interface UpdateObjectOptions {
  object: WarrantObject | WarrantObjectLiteral;
  meta: { [key: string]: any };
}

export type DeleteObjectOptions = WarrantObject | WarrantObjectLiteral;

export interface SerializedDeleteObjectOptions {
  object_type: string;
  object_id: string;
}

export interface BaseWarrantObject {
  objectType: string;
  objectId: string;
  meta?: { [key: string]: any };
}

export interface WarrantObjectResponse {
  object_type: string;
  object_id: string;
  meta?: { [key: string]: any };
}
